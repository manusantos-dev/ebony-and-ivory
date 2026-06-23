/**
 * @file notation-renderer.js
 * @description Notation Renderer Engine (VexFlow Integration).
 * Renders polyphonic musical objects into structured SVGs using a Virtual Scrolling mechanism via IntersectionObserver.
 * Features strict A4 mathematical mapping and print-spooler layout preservation independent of viewport zoom.
 */

import * as VF from 'vexflow';
import { state } from '../core/state.js';
import { t } from '../ui/i18n.js';
import { persistScore, measureNeededQuarters, quartersUsed, escapeHtml, trim } from '../core/storage.js';
import { emit } from '../core/events.js';

const RENDER_CFG = { MEASURES_PER_LINE: 4, LINES_PER_PAGE: 4, TOTAL_WIDTH: 1020, TOTAL_HEIGHT: 1443, LEFT_MARGIN: 40, FIRST_LINE_WIDTH: 330, REST_LINE_WIDTH: 200, STAVE_GAP: 120, LINE_GAP: 280, TOP_MARGIN_FIRST: 320, TOP_MARGIN_REST: 120 };

let pageObserver = null;
let printHandlersBound = false;

/**
 * @param {Array} notes
 * @returns {Array}
 */
const safeBeam = (notes) => {
  if (!notes || notes.length === 0) return [];
  try { return VF.Beam.generateBeams(notes, { beam_rests: false }); } catch { return []; }
};

/**
 * @param {HTMLElement} pageDiv
 */
const clearPage = (pageDiv) => {
  const wrap = pageDiv.querySelector(".svg-wrap");
  if (wrap) wrap.innerHTML = "";
};

/**
 * @param {number} p
 * @param {HTMLElement} pageDiv
 * @param {Object} score
 */
const renderPage = (p, pageDiv, score) => {
  const { measures, timeSig, keySig, bpm } = score;
  const [num, den] = timeSig.split("/").map(Number);
  const totalLines = Math.ceil(measures.length / RENDER_CFG.MEASURES_PER_LINE);
  const totalPages = Math.ceil(totalLines / RENDER_CFG.LINES_PER_PAGE) || 1;
  const linesOnThisPage = Math.min(RENDER_CFG.LINES_PER_PAGE, totalLines - p * RENDER_CFG.LINES_PER_PAGE);
  const startY = p === 0 ? RENDER_CFG.TOP_MARGIN_FIRST : RENDER_CFG.TOP_MARGIN_REST;

  const headerHtml = p === 0 ? `<div class="score-letterhead" style="position:absolute;top:50px;left:40px;right:40px;z-index:10;"><div class="print-only" style="text-align:left;margin-bottom:15px;"><img src="assets/ebony-ivory-wordmark.png" style="height:24px;"></div><h2 style="margin:0 0 5px 0;">${escapeHtml(score.title || t("untitled"))}</h2><p style="margin:0;">${(score.composer || "").split(",").map(c => `<span>${escapeHtml(c.trim())}</span>`).join(" &middot; ")}</p></div>` : "";
  const footerHtml = `<div class="print-footer-content print-only" style="position:absolute;bottom:30px;left:40px;right:40px;display:flex;justify-content:space-between;z-index:10;font-size:12px;"><span><strong>Ebony & Ivory</strong></span> <span>${p + 1} / ${totalPages}</span></div>`;
  
  pageDiv.innerHTML = `${headerHtml}<div class="svg-wrap" style="position:absolute;top:0;left:0;width:100%;height:100%;"></div>${footerHtml}`;
  
  const svgWrap = pageDiv.querySelector(".svg-wrap");
  const renderer = new VF.Renderer(svgWrap, VF.Renderer.Backends.SVG);
  renderer.resize(RENDER_CFG.TOTAL_WIDTH, RENDER_CFG.TOTAL_HEIGHT);
  const ctx = renderer.getContext();
  const hitRects = [];

  for (let l = 0; l < linesOnThisPage; l++) {
    const globalLineIdx = p * RENDER_CFG.LINES_PER_PAGE + l;
    for (let m = 0; m < RENDER_CFG.MEASURES_PER_LINE; m++) {
      const idx = globalLineIdx * RENDER_CFG.MEASURES_PER_LINE + m;
      if (idx >= measures.length) break;

      const measure = measures[idx];
      const isFirstOfLine = m === 0;
      const width = isFirstOfLine ? RENDER_CFG.FIRST_LINE_WIDTH : RENDER_CFG.REST_LINE_WIDTH;
      const x = RENDER_CFG.LEFT_MARGIN + (isFirstOfLine ? 0 : RENDER_CFG.FIRST_LINE_WIDTH + RENDER_CFG.REST_LINE_WIDTH * (m - 1));
      const yTreble = startY + l * RENDER_CFG.LINE_GAP;
      const yBass = yTreble + RENDER_CFG.STAVE_GAP;

      const staveTreble = new VF.Stave(x, yTreble, width);
      const staveBass = new VF.Stave(x, yBass, width);

      if (isFirstOfLine) {
        staveTreble.addClef("treble"); staveBass.addClef("bass");
        if (keySig && keySig !== "C") { staveTreble.addKeySignature(keySig); staveBass.addKeySignature(keySig); }
      }
      
      if (idx === 0) {
        staveTreble.addTimeSignature(timeSig); staveBass.addTimeSignature(timeSig);
        staveTreble.setTempo({ duration: "q", dots: 0, bpm: bpm || 100 }, -25);
      }

      const noteStartOffset = isFirstOfLine ? 120 : 15;
      staveTreble.setNoteStartX(x + noteStartOffset); staveBass.setNoteStartX(x + noteStartOffset);
      staveTreble.setBegBarType(measure.repeatStart ? VF.Barline.type.REPEAT_BEGIN : VF.Barline.type.SINGLE);
      staveBass.setBegBarType(measure.repeatStart ? VF.Barline.type.REPEAT_BEGIN : VF.Barline.type.SINGLE);
      
      const endType = measure.repeatEnd ? VF.Barline.type.REPEAT_END : measure.directive === "Fine" ? VF.Barline.type.DOUBLE : /D\.(C|S)\./.test(measure.directive) || idx === measures.length - 1 ? VF.Barline.type.END : VF.Barline.type.SINGLE;
      staveTreble.setEndBarType(endType); staveBass.setEndBarType(endType);
      
      staveTreble.setContext(ctx).draw(); staveBass.setContext(ctx).draw();

      if (isFirstOfLine) {
        new VF.StaveConnector(staveTreble, staveBass).setType(VF.StaveConnector.type.BRACE).setContext(ctx).draw();
        new VF.StaveConnector(staveTreble, staveBass).setType(VF.StaveConnector.type.SINGLE_LEFT).setContext(ctx).draw();
      }
      
      const rightConnectorType = endType === VF.Barline.type.DOUBLE ? VF.StaveConnector.type.THIN_DOUBLE : endType === VF.Barline.type.END || endType === VF.Barline.type.REPEAT_END ? VF.StaveConnector.type.BOLD_DOUBLE_RIGHT : VF.StaveConnector.type.SINGLE_RIGHT;
      new VF.StaveConnector(staveTreble, staveBass).setType(rightConnectorType).setContext(ctx).draw();

      const buildNotes = (staffNotes, clef, staffName) => staffNotes.map((n, nIdx) => {
        const durStr = n.duration + (n.dotted ? "d" : "") + (n.rest ? "r" : "");
        const keys = n.rest ? [clef === "bass" ? "d/3" : "b/4"] : (n.keys || []).map(k => `${k.letter.toLowerCase()}${k.accidental || ""}/${k.octave}`);
        const sn = new VF.StaveNote({ clef, keys, duration: durStr, auto_stem: true });
        sn.setAttribute("id", `vf-note-${idx}-${staffName}-${nIdx}`);
        
        if (n.dotted) VF.Dot.buildAndAttach([sn], { all: true });
        if (!n.rest && n.keys) n.keys.forEach((k, kIdx) => k.accidental && sn.addModifier(new VF.Accidental(k.accidental), kIdx));
        if (n.lyric) sn.addModifier(new VF.Annotation(n.lyric).setFont("Times", 12).setVerticalJustification(3), 0);
        if (n.fingering) sn.addModifier(new VF.Annotation(n.fingering).setFont("Times", 12, "bold").setVerticalJustification(clef === "bass" ? 3 : 1).setYShift(clef === "bass" ? 5 : -5), 0);
        if (n.dynamic) sn.addModifier(new VF.Annotation(n.dynamic).setFont("Times", 12, "italic bold").setVerticalJustification(clef === "bass" ? 4 : 3), 0);
        if (state.editorState.editingNoteIdx === nIdx && state.editorState.activeStaff === staffName && state.editorState.activeMeasure === idx) sn.setStyle({ fillStyle: '#B38E50', strokeStyle: '#B38E50' });
        
        return sn;
      });

      try {
        const trebleNotes = (measure.treble && measure.treble.length) ? buildNotes(measure.treble, "treble", "treble") : [new VF.StaveNote({ clef: "treble", keys: ["b/4"], duration: "1r", align_center: true })];
        const bassNotes = (measure.bass && measure.bass.length) ? buildNotes(measure.bass, "bass", "bass") : [new VF.StaveNote({ clef: "bass", keys: ["d/3"], duration: "1r", align_center: true })];
        
        const trebleBeams = safeBeam(measure.treble && measure.treble.length ? trebleNotes : []);
        const bassBeams = safeBeam(measure.bass && measure.bass.length ? bassNotes : []);
        
        const vTreble = new VF.Voice({ num_beats: num, beat_value: den }).setMode(VF.Voice.Mode.SOFT);
        const vBass = new VF.Voice({ num_beats: num, beat_value: den }).setMode(VF.Voice.Mode.SOFT);
        const voices = [];

        vTreble.addTickables(trebleNotes); voices.push(vTreble);
        vBass.addTickables(bassNotes); voices.push(vBass);

        if (measure.directive) {
          const targetNotes = measure.treble && measure.treble.length ? trebleNotes : bassNotes;
          if (targetNotes.length) try { targetNotes[targetNotes.length - 1].addModifier(new VF.Annotation(measure.directive).setFont("Times", 12, "italic bold").setVerticalJustification(3).setJustification(2).setYShift(15), 0); } catch(e) {}
        }

        const innerWidth = width - noteStartOffset - 15;
        const formatter = new VF.Formatter();
        try { formatter.joinVoices(voices).format(voices, innerWidth); } 
        catch { voices.forEach(v => new VF.Formatter().joinVoices([v]).format([v], innerWidth)); }
        
        vTreble.draw(ctx, staveTreble); trebleBeams.forEach(b => b.setContext(ctx).draw());
        vBass.draw(ctx, staveBass); bassBeams.forEach(b => b.setContext(ctx).draw());
      } catch (measureErr) {
        console.error(`Render Error M${idx + 1}:`, measureErr);
        const errText = document.createElementNS("http://www.w3.org/2000/svg", "text");
        errText.setAttribute("x", x + 10); errText.setAttribute("y", yTreble + 20); errText.setAttribute("fill", "var(--color-danger)"); errText.setAttribute("font-size", "11"); errText.textContent = `⚠ Error M${idx + 1}`;
        ctx.svg.appendChild(errText);
      }

      const hitX = staveTreble.getNoteStartX() - 8, hitRight = staveTreble.getX() + staveTreble.getWidth(); 
      hitRects.push({ x: hitX, y: staveTreble.getYForLine(0) - 35, width: hitRight - hitX, height: staveBass.getYForLine(4) - staveTreble.getYForLine(0) + 70, startX: hitX + 8, endX: staveTreble.getNoteEndX(), idx });
    }
  }

  const svg = svgWrap.querySelector("svg");
  if (svg) {
    svg.setAttribute("viewBox", `0 0 ${RENDER_CFG.TOTAL_WIDTH} ${RENDER_CFG.TOTAL_HEIGHT}`);
    svg.setAttribute("width", "100%");
    svg.setAttribute("height", "100%");
    svg.style.display = "block";
    const ns = "http://www.w3.org/2000/svg";
    hitRects.forEach(hr => {
      const g = document.createElementNS(ns, "g");
      g.setAttribute("class", `measure-hit${hr.idx === state.editorState.activeMeasure ? " active" : ""}`);
      ["data-measure-idx", "data-start-x", "data-end-x", "data-y", "data-h"].forEach((attr, i) => g.setAttribute(attr, [hr.idx, hr.startX, hr.endX, hr.y, hr.height][i]));

      const rect = document.createElementNS(ns, "rect");
      ["x", "y", "width", "height"].forEach((attr, i) => rect.setAttribute(attr, [hr.x, hr.y, hr.width, hr.height][i]));
      rect.setAttribute("fill", hr.idx === state.editorState.activeMeasure ? "rgba(179, 142, 80, 0.15)" : "transparent");
      rect.setAttribute("rx", "4");
      
      g.appendChild(rect);
      g.addEventListener("click", () => { state.editorState.activeMeasure = hr.idx; emit("measureselected", hr.idx); renderScore(); });
      svg.appendChild(g);
    });
  }
};

/**
 * @export
 */
export const renderScore = () => {
  const score = state.currentScore;
  if (!score) return;
  persistScore(score);

  const container = document.getElementById("vexPagesContainer");
  if (!container) return;

  if (!printHandlersBound) {
    if (!document.getElementById("ei-print-fix")) {
      const style = document.createElement("style");
      style.id = "ei-print-fix";
      style.textContent = `@media print{@page{size:A4 portrait;margin:0}body{zoom:1!important;margin:0;padding:0}.paper-page{width:210mm!important;height:296mm!important;margin:0!important;padding:0!important;page-break-after:always!important;page-break-inside:avoid!important;position:relative!important;overflow:hidden!important}.paper-page:last-of-type{page-break-after:avoid!important}}`;
      document.head.appendChild(style);
    }
    
    window.addEventListener("beforeprint", () => {
      if (pageObserver) pageObserver.disconnect();
      document.querySelectorAll(".paper-page").forEach(div => {
        if (!div.querySelector("svg")) renderPage(Number(div.dataset.page), div, state.currentScore);
      });
      void document.body.offsetHeight;
    });
    
    window.addEventListener("afterprint", () => renderScore());
    printHandlersBound = true;
  }

  try {
    const { measures, timeSig } = score;
    const totalLines = Math.ceil(measures.length / RENDER_CFG.MEASURES_PER_LINE);
    const totalPages = Math.ceil(totalLines / RENDER_CFG.LINES_PER_PAGE) || 1;

    if (pageObserver) {
      pageObserver.disconnect();
      pageObserver = null;
    }

    pageObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => entry.isIntersecting ? renderPage(Number(entry.target.dataset.page), entry.target, score) : clearPage(entry.target));
    }, { rootMargin: "100% 0px", threshold: 0.01 });

    container.innerHTML = "";

    for (let p = 0; p < totalPages; p++) {
      const pageDiv = document.createElement("div");
      pageDiv.className = "paper-page";
      pageDiv.dataset.page = p;
      pageDiv.style.position = "relative";
      pageDiv.style.aspectRatio = "210 / 297"; 
      
      container.appendChild(pageDiv);
      pageObserver.observe(pageDiv);
    }

    const needed = measureNeededQuarters(timeSig), m = measures[state.editorState.activeMeasure], lbl = document.getElementById("activeMeasureLabel");
    if (lbl && m) lbl.textContent = `${state.editorState.activeMeasure + 1}/${measures.length} · ♩ Sol ${trim(quartersUsed(m.treble))}/${trim(needed)} · Fa ${trim(quartersUsed(m.bass))}/${trim(needed)}`;
  } catch (err) {
    console.error(err);
    container.innerHTML = '<p style="padding:40px;color:var(--color-danger);font-weight:bold;">Render Error.</p>';
  }
};