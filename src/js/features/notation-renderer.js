/**
 * @file notation-renderer.js
 * @description Notation Renderer Engine (VexFlow Integration).
 * Applies High-Res A4 bounding boxes (1200x1697) with strict absolute positioning.
 */

import * as VF from 'vexflow';
import { state } from '../core/state.js';
import { t } from '../ui/i18n.js';
import { persistScore, measureNeededQuarters, quartersUsed, escapeHtml, trim } from '../core/storage.js';
import { emit } from '../core/events.js';

// HIGH-RES MATHEMATICAL BOUNDS: TOP_MARGIN_FIRST adjusted to 340px to lift the first line of music up, keeping the header detached.
const MEASURES = 4;
const LEFT_M = 100;
const RIGHT_M = 100;
const FIRST_W = 320;
const TOTAL_W = 1200;
const TOTAL_H = 1697;
const REST_W = (TOTAL_W - LEFT_M - RIGHT_M - FIRST_W) / (MEASURES - 1);

const RENDER_CFG = { MEASURES_PER_LINE: MEASURES, LINES_PER_PAGE: 4, TOTAL_WIDTH: TOTAL_W, TOTAL_HEIGHT: TOTAL_H, LEFT_MARGIN: LEFT_M, FIRST_LINE_WIDTH: FIRST_W, REST_LINE_WIDTH: REST_W, STAVE_GAP: 110, LINE_GAP: 290, TOP_MARGIN_FIRST: 340, TOP_MARGIN_REST: 160 };

let pageObserver = null;
let printHandlersBound = false;
let isFlipping = false;

/** @param {Array} notes @returns {Array} */
const safeBeam = (notes) => {
  if (!notes || notes.length === 0) return [];
  try { return VF.Beam.generateBeams(notes, { beam_rests: false }); } catch { return []; }
};

/** @param {HTMLElement} pageDiv */
const clearPage = (pageDiv) => {
  const wrap = pageDiv.querySelector(".svg-wrap");
  if (wrap) wrap.innerHTML = "";
};

/** @returns {number} */
const getActivePagesCount = () => {
  const measures = state.currentScore?.measures || [];
  let last = 0;
  for (let i = measures.length - 1; i >= 0; i--) {
    const m = measures[i];
    if (!m) continue;
    const hasNotes = v => {
      if (!v || v.length === 0) return false;
      const flat = Array.isArray(v[0]) ? v.flat() : v;
      return flat.some(n => !n.rest || flat.length > 1);
    };
    if (hasNotes(m.treble) || hasNotes(m.bass)) { last = i; break; }
  }
  const lines = Math.ceil((last + 1) / RENDER_CFG.MEASURES_PER_LINE);
  return Math.max(1, Math.ceil(lines / RENDER_CFG.LINES_PER_PAGE));
};

/**
 * @param {number} pageIdx
 * @param {HTMLElement} pageDiv
 * @param {Object} score
 */
const renderPage = (pageIdx, pageDiv, score) => {
  const { measures = [], timeSig = "4/4", keySig = "C", bpm = 100, title = "", composer = "" } = score;
  const [num, den] = (typeof timeSig === "string" ? timeSig : "4/4").split("/").map(Number);
  
  const totalLines = Math.ceil(measures.length / RENDER_CFG.MEASURES_PER_LINE);
  const totalPages = Math.ceil(totalLines / RENDER_CFG.LINES_PER_PAGE) || 1;
  const linesOnThisPage = Math.min(RENDER_CFG.LINES_PER_PAGE, totalLines - pageIdx * RENDER_CFG.LINES_PER_PAGE);
  const startY = pageIdx === 0 ? RENDER_CFG.TOP_MARGIN_FIRST : RENDER_CFG.TOP_MARGIN_REST;
  
  const isViewer = document.body.classList.contains("is-viewer");
  const isBook = state.editorState.layoutMode === "book";
  const isLeftPage = pageIdx % 2 === 0;

  const safeTitle = escapeHtml(title || t("untitled"));
  const safeComposer = composer ? composer.split(",").map(c => `<span>${escapeHtml(c.trim())}</span>`).join(" &middot; ") : "";

  // Pure HTML. Opacity/Filter handles entirely by CSS class "footer-logo"
  const wordmarkHTML = `<img src="assets/ebony-ivory-wordmark.png" class="footer-logo" style="height:28px; vertical-align:middle;">`;
  const pageHTML = `<span class="page-counter" style="font-family:var(--font-display, Georgia, serif); font-size:26px; font-weight:700; color:var(--color-ink);">${pageIdx + 1} / ${totalPages}</span>`;
  
  let footerLeft = "", footerRight = "";
  if (isBook) {
    if (isLeftPage) { footerLeft = pageHTML; footerRight = wordmarkHTML; } 
    else { footerLeft = wordmarkHTML; footerRight = pageHTML; }
  } else {
    footerLeft = pageHTML; footerRight = wordmarkHTML;
  }
  const footerHtml = `<div class="print-footer-content" style="position:absolute;bottom:60px;left:100px;right:100px;display:flex;justify-content:space-between;align-items:center;z-index:10;color:var(--color-ink);"><div>${footerLeft}</div><div>${footerRight}</div></div>`;

  // Title top set to 100px
  const headerHtml = pageIdx === 0 ? `<div class="score-letterhead" style="position:absolute;top:100px;left:0;width:100%;text-align:center;z-index:10;color:var(--color-ink);"><h2 style="font-family:var(--font-display, Georgia, serif);font-size:56px;font-weight:700;margin:0 0 16px 0;letter-spacing:1px;font-style:italic;">${safeTitle}</h2><p style="font-family:var(--font-display, Georgia, serif);font-size:26px;margin:0;color:var(--color-ink-soft);font-weight:500;letter-spacing:1px;">${safeComposer}</p></div>` : "";
  
  pageDiv.innerHTML = `${headerHtml}<div class="svg-wrap" style="position:relative; width:100%; line-height:0;"></div>${footerHtml}`;
  
  const svgWrap = pageDiv.querySelector(".svg-wrap");
  const renderer = new VF.Renderer(svgWrap, VF.Renderer.Backends.SVG);
  renderer.resize(RENDER_CFG.TOTAL_WIDTH, RENDER_CFG.TOTAL_HEIGHT);
  const ctx = renderer.getContext();
  const hitRects = [];

  for (let line = 0; line < linesOnThisPage; line++) {
    const globalLineIdx = pageIdx * RENDER_CFG.LINES_PER_PAGE + line;
    for (let m = 0; m < RENDER_CFG.MEASURES_PER_LINE; m++) {
      const idx = globalLineIdx * RENDER_CFG.MEASURES_PER_LINE + m;
      if (idx >= measures.length) break;

      const measure = measures[idx] || { treble: [], bass: [] };
      const isFirstOfLine = m === 0;
      const width = isFirstOfLine ? RENDER_CFG.FIRST_LINE_WIDTH : RENDER_CFG.REST_LINE_WIDTH;
      const x = RENDER_CFG.LEFT_MARGIN + (isFirstOfLine ? 0 : RENDER_CFG.FIRST_LINE_WIDTH + RENDER_CFG.REST_LINE_WIDTH * (m - 1));
      const yTreble = startY + line * RENDER_CFG.LINE_GAP;
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

      let activeTies = [];

      const buildNotes = (staffNotes, clef, staffName, stemDir) => staffNotes.map((n, nIdx) => {
        const durStr = n.duration + (n.dotted ? "d" : "") + (n.rest ? "r" : "");
        const keys = n.rest ? [clef === "bass" ? "d/3" : "b/4"] : (n.keys || []).map(k => `${k.letter.toLowerCase()}${k.accidental || ""}/${k.octave}`);
        
        const noteParams = { clef, keys, duration: durStr };
        if (stemDir !== 'auto') noteParams.stem_direction = stemDir;
        else noteParams.auto_stem = true;

        const sn = new VF.StaveNote(noteParams);
        sn.setAttribute("id", `vf-note-${idx}-${staffName}-${nIdx}`);
        
        if (n.dotted) VF.Dot.buildAndAttach([sn], { all: true });
        if (!n.rest && n.keys) n.keys.forEach((k, kIdx) => k.accidental && sn.addModifier(new VF.Accidental(k.accidental), kIdx));
        if (n.lyric) sn.addModifier(new VF.Annotation(n.lyric).setFont("Times", 12).setVerticalJustification(3), 0);
        if (n.fingering) sn.addModifier(new VF.Annotation(n.fingering).setFont("Times", 12, "bold").setVerticalJustification(clef === "bass" ? 3 : 1).setYShift(clef === "bass" ? 5 : -5), 0);
        if (n.dynamic) sn.addModifier(new VF.Annotation(n.dynamic).setFont("Times", 12, "italic bold").setVerticalJustification(clef === "bass" ? 4 : 3), 0);
        
        if (n.articulation) {
          const artMap = { 'staccato': 'a.', 'accent': 'a>', 'tenuto': 'a-', 'marcato': 'a^' };
          if (artMap[n.articulation]) sn.addModifier(new VF.Articulation(artMap[n.articulation]).setPosition(stemDir === 1 || (stemDir === 'auto' && clef === 'bass') ? 4 : 3), 0);
        }
        return sn;
      });

      const parseVoices = (staffData, clef, staffName) => {
        if (!staffData || staffData.length === 0) return { vfVoices: [new VF.Voice({ num_beats: num, beat_value: den }).setMode(VF.Voice.Mode.SOFT).addTickables([new VF.StaveNote({ clef, keys: [clef === "bass" ? "d/3" : "b/4"], duration: "1r", align_center: true })])], vfBeams: [] };
        
        const isPoly = Array.isArray(staffData[0]);
        const voicesData = isPoly ? staffData : [staffData];
        const vfVoices = [];
        let vfBeams = [];
        
        voicesData.forEach((voiceNotes, vIdx) => {
          const stemDir = isPoly ? (vIdx === 0 ? 1 : -1) : 'auto';
          const vfNotes = buildNotes(voiceNotes, clef, staffName, stemDir);
          
          voiceNotes.forEach((n, i) => { if (n.tie && i < voiceNotes.length - 1 && !n.rest) activeTies.push(new VF.StaveTie({ first_note: vfNotes[i], last_note: vfNotes[i+1] })); });
          vfBeams = vfBeams.concat(safeBeam(vfNotes));
          vfVoices.push(new VF.Voice({ num_beats: num, beat_value: den }).setMode(VF.Voice.Mode.SOFT).addTickables(vfNotes));
        });
        return { vfVoices, vfBeams };
      };

      try {
        const trebleParsed = parseVoices(measure.treble, "treble", "treble");
        const bassParsed = parseVoices(measure.bass, "bass", "bass");
        const allVoices = [...trebleParsed.vfVoices, ...bassParsed.vfVoices];

        if (measure.directive) {
          const targetNotes = measure.treble && measure.treble.length ? trebleParsed.vfVoices[0].getTickables() : bassParsed.vfVoices[0].getTickables();
          if (targetNotes.length) try { targetNotes[targetNotes.length - 1].addModifier(new VF.Annotation(measure.directive).setFont("Times", 12, "italic bold").setVerticalJustification(3).setJustification(2).setYShift(15), 0); } catch(e) {}
        }

        const innerWidth = width - noteStartOffset - 15;
        const formatter = new VF.Formatter();
        try { formatter.joinVoices(allVoices).format(allVoices, innerWidth); } 
        catch { allVoices.forEach(v => new VF.Formatter().joinVoices([v]).format([v], innerWidth)); }
        
        trebleParsed.vfVoices.forEach(v => v.draw(ctx, staveTreble));
        bassParsed.vfVoices.forEach(v => v.draw(ctx, staveBass));
        [...trebleParsed.vfBeams, ...bassParsed.vfBeams].forEach(b => b.setContext(ctx).draw());
        activeTies.forEach(t => t.setContext(ctx).draw());
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
    svg.setAttribute("preserveAspectRatio", "xMidYMid meet");
    svg.setAttribute("width", "100%");
    svg.setAttribute("height", "auto");
    const ns = "http://www.w3.org/2000/svg";
    
    // Hitboxes ALWAYS injected for audio tracking, visibility handled via CSS opacity
    hitRects.forEach(hr => {
      const g = document.createElementNS(ns, "g");
      g.setAttribute("class", `measure-hit${hr.idx === state.editorState.activeMeasure ? " active" : ""}`);
      ["data-measure-idx", "data-start-x", "data-end-x", "data-y", "data-h"].forEach((attr, i) => g.setAttribute(attr, [hr.idx, hr.startX, hr.endX, hr.y, hr.height][i]));

      const rect = document.createElementNS(ns, "rect");
      ["x", "y", "width", "height"].forEach((attr, i) => rect.setAttribute(attr, [hr.x, hr.y, hr.width, hr.height][i]));
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

  const isBook = state.editorState.layoutMode === "book";
  const { measures = [], timeSig = "4/4" } = score;
  const isPrinting = document.body.classList.contains("is-printing");
  
  const totalLines = Math.ceil(measures.length / RENDER_CFG.MEASURES_PER_LINE);
  const totalPages = Math.ceil(totalLines / RENDER_CFG.LINES_PER_PAGE) || 1;
  const activeCount = getActivePagesCount();

  if (!printHandlersBound) {
    window.addEventListener("beforeprint", () => {
      document.body.classList.add("is-printing");
      
      if (document.body.classList.contains("dark-theme")) {
        document.body.dataset.wasDark = "true";
        document.body.classList.remove("dark-theme");
      }
      
      if (pageObserver) pageObserver.disconnect();
      renderScore();
      
      void document.body.offsetHeight;
    });
    
    window.addEventListener("afterprint", () => {
      document.body.classList.remove("is-printing");
      if (document.body.dataset.wasDark === "true") {
        document.body.classList.add("dark-theme");
        delete document.body.dataset.wasDark;
      }
      renderScore();
    });
    printHandlersBound = true;
  }

  let bookSpread = state.editorState.bookSpread || 0;
  const maxSpread = Math.ceil(totalPages / 2) - 1;
  if (bookSpread > maxSpread) bookSpread = Math.max(0, maxSpread);
  state.editorState.bookSpread = bookSpread;

  if (pageObserver) {
    pageObserver.disconnect();
    pageObserver = null;
  }

  if (!isBook && !isPrinting) {
    pageObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => entry.isIntersecting ? renderPage(Number(entry.target.dataset.page), entry.target, score) : clearPage(entry.target));
    }, { rootMargin: "100% 0px", threshold: 0.01 });
  }

  container.innerHTML = "";

  for (let p = 0; p < totalPages; p++) {
    const pageDiv = document.createElement("div");
    pageDiv.className = "paper-page";
    pageDiv.dataset.page = p;
    container.appendChild(pageDiv);

    if (isPrinting) {
      if (p < activeCount) {
        pageDiv.style.display = "block";
        if (isBook) pageDiv.classList.add(p % 2 === 0 ? "book-page-left" : "book-page-right");
        renderPage(p, pageDiv, score);
      } else {
        pageDiv.classList.add("is-hidden-print");
        pageDiv.style.display = "none";
      }
    } else {
      if (isBook) {
        const isVisible = (p === bookSpread * 2) || (p === bookSpread * 2 + 1);
        pageDiv.style.display = isVisible ? "block" : "none";
        if (isVisible) {
          const isLeftPage = p % 2 === 0;
          pageDiv.classList.add(isLeftPage ? "book-page-left" : "book-page-right");
          renderPage(p, pageDiv, score);

          if (totalPages > 1) {
            const addZone = (corner, direction) => {
              const z = document.createElement("div");
              z.className = `turn-zone turn-${corner}`;
              z.onclick = () => {
                if (isFlipping) return;
                isFlipping = true;
                const flipper = document.createElement("div");
                flipper.className = `book-flipper flip-${direction}`;
                container.appendChild(flipper);
                setTimeout(() => {
                  state.editorState.bookSpread += direction === 'next' ? 1 : -1;
                  renderScore();
                  setTimeout(() => { isFlipping = false; }, 100);
                }, 350);
              };
              pageDiv.appendChild(z);
            };

            if (isLeftPage && bookSpread > 0) { addZone('tl', 'prev'); addZone('bl', 'prev'); } 
            else if (!isLeftPage && bookSpread < maxSpread) { addZone('tr', 'next'); addZone('br', 'next'); }
          }
        }
      } else {
        pageObserver.observe(pageDiv);
      }
    }
  }

  try {
    const needed = measureNeededQuarters(timeSig), m = measures[state.editorState.activeMeasure], lbl = document.getElementById("activeMeasureLabel");
    if (lbl && m) {
      const getUsed = v => Array.isArray(v?.[0]) ? quartersUsed(v[0]) : quartersUsed(v);
      lbl.textContent = `${state.editorState.activeMeasure + 1}/${measures.length} · ♩ Sol ${trim(getUsed(m.treble))}/${trim(needed)} · Fa ${trim(getUsed(m.bass))}/${trim(needed)}`;
    }
  } catch (err) {
    console.error(err);
    container.innerHTML = '<p style="padding:40px;color:var(--color-danger);font-weight:bold;">Render Error.</p>';
  }
};