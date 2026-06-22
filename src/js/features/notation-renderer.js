/**
 * Notation Renderer Engine (VexFlow Integration)
 * Renders polyphonic musical objects into structured SVGs.
 */

import * as VF from 'vexflow';
import { state } from '../core/state.js';
import { t } from '../ui/i18n.js';
import { persistScore, measureNeededQuarters, quartersUsed, escapeHtml, trim } from '../core/storage.js';
import { emit } from '../core/events.js';

const RENDER_CFG = { MEASURES_PER_LINE: 4, LINES_PER_PAGE: 4, TOTAL_WIDTH: 1020, LEFT_MARGIN: 40, FIRST_LINE_WIDTH: 330, REST_LINE_WIDTH: 200, STAVE_GAP: 120, LINE_GAP: 240, TOP_MARGIN: 20 };

const safeBeam = (notes) => {
  if (!notes || notes.length === 0) return [];
  try { return VF.Beam.generateBeams(notes, { beam_rests: false }); } catch { return []; }
};

export function renderScore() {
  const score = state.currentScore;
  if (!score) return;
  persistScore(score);

  const container = document.getElementById("vexPagesContainer");
  if (!container) return;
  container.innerHTML = "";

  try {
    const { measures, timeSig, keySig, bpm } = score;
    const [num, den] = timeSig.split("/").map(Number);
    const totalLines = Math.ceil(measures.length / RENDER_CFG.MEASURES_PER_LINE);
    const totalPages = Math.ceil(totalLines / RENDER_CFG.LINES_PER_PAGE) || 1;

    for (let p = 0; p < totalPages; p++) {
      const pageDiv = document.createElement("div");
      pageDiv.className = "paper-page";

      let startY = RENDER_CFG.TOP_MARGIN;
      if (p === 0) {
        const head = document.createElement("div");
        head.className = "score-letterhead";
        head.innerHTML = `
          <div class="print-only" style="text-align: left; margin-bottom: 25px;"><img src="assets/ebony-ivory-wordmark.png" style="height: 24px;"></div>
          <h2>${escapeHtml(score.title || t("untitled"))}</h2>
          <p>${(score.composer || "").split(",").map(c => `<span>${escapeHtml(c.trim())}</span>`).join(" &middot; ")}</p>`;
        pageDiv.appendChild(head);
        startY += 85;
      }

      const svgWrap = document.createElement("div");
      pageDiv.appendChild(svgWrap);
      const printFooter = document.createElement("div");
      printFooter.className = "print-footer-content print-only";
      printFooter.innerHTML = `<span><strong>Ebony & Ivory</strong></span> <span>${p + 1} / ${totalPages}</span>`;
      pageDiv.appendChild(printFooter);
      container.appendChild(pageDiv);
      
      const linesOnThisPage = Math.min(RENDER_CFG.LINES_PER_PAGE, totalLines - p * RENDER_CFG.LINES_PER_PAGE);
      const pageHeight = startY + linesOnThisPage * RENDER_CFG.LINE_GAP + 20;

      const renderer = new VF.Renderer(svgWrap, VF.Renderer.Backends.SVG);
      renderer.resize(RENDER_CFG.TOTAL_WIDTH, pageHeight);
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
          
          let endType = VF.Barline.type.SINGLE;
          if (measure.repeatEnd) endType = VF.Barline.type.REPEAT_END;
          else if (measure.directive === "Fine") endType = VF.Barline.type.DOUBLE; 
          else if (measure.directive && /D\.(C|S)\./.test(measure.directive)) endType = VF.Barline.type.END;
          else if (idx === measures.length - 1) endType = VF.Barline.type.END;
          
          staveTreble.setEndBarType(endType); staveBass.setEndBarType(endType);
          staveTreble.setContext(ctx).draw(); staveBass.setContext(ctx).draw();

          if (isFirstOfLine) {
            new VF.StaveConnector(staveTreble, staveBass).setType(VF.StaveConnector.type.BRACE).setContext(ctx).draw();
            new VF.StaveConnector(staveTreble, staveBass).setType(VF.StaveConnector.type.SINGLE_LEFT).setContext(ctx).draw();
          }
          
          let rightConnectorType = VF.StaveConnector.type.SINGLE_RIGHT;
          if (endType === VF.Barline.type.DOUBLE) rightConnectorType = VF.StaveConnector.type.THIN_DOUBLE; 
          else if (endType === VF.Barline.type.END || endType === VF.Barline.type.REPEAT_END) rightConnectorType = VF.StaveConnector.type.BOLD_DOUBLE_RIGHT;
          new VF.StaveConnector(staveTreble, staveBass).setType(rightConnectorType).setContext(ctx).draw();

          const buildNotes = (staffNotes, clef, staffName) => {
            return staffNotes.map((n, nIdx) => {
              const durStr = n.duration + (n.dotted ? "d" : "") + (n.rest ? "r" : "");
              
              // Map Polyphonic schema to VexFlow keys array
              const keys = n.rest 
                ? [clef === "bass" ? "d/3" : "b/4"] 
                : (n.keys || []).map(k => `${k.letter.toLowerCase()}${k.accidental || ""}/${k.octave}`);

              const sn = new VF.StaveNote({ clef, keys, duration: durStr, auto_stem: true });
              sn.setAttribute("id", `vf-note-${idx}-${staffName}-${nIdx}`);
              
              if (n.dotted) VF.Dot.buildAndAttach([sn], { all: true });

              // Apply accidentals per-key index
              if (!n.rest && n.keys) {
                n.keys.forEach((k, kIdx) => {
                  if (k.accidental) sn.addModifier(new VF.Accidental(k.accidental), kIdx);
                });
              }
              
              if (n.lyric) sn.addModifier(new VF.Annotation(n.lyric).setFont("Times", 12).setVerticalJustification(3), 0);
              
              if (n.fingering) {
                const isBass = clef === "bass";
                sn.addModifier(new VF.Annotation(n.fingering).setFont("Times", 12, "bold").setVerticalJustification(isBass ? 3 : 1).setYShift(isBass ? 5 : -5), 0);
              }

              if (n.dynamic) sn.addModifier(new VF.Annotation(n.dynamic).setFont("Times", 12, "italic bold").setVerticalJustification(clef === "bass" ? 4 : 3), 0);

              if (state.editorState.editingNoteIdx === nIdx && state.editorState.activeStaff === staffName && state.editorState.activeMeasure === idx) {
                sn.setStyle({ fillStyle: '#B38E50', strokeStyle: '#B38E50' });
              }

              return sn;
            });
          };

          try {
            const trebleNotes = buildNotes(measure.treble, "treble", "treble"), bassNotes = buildNotes(measure.bass, "bass", "bass");
            const trebleBeams = safeBeam(trebleNotes), bassBeams = safeBeam(bassNotes);
            const vTreble = new VF.Voice({ num_beats: num, beat_value: den }).setMode(VF.Voice.Mode.SOFT);
            const vBass = new VF.Voice({ num_beats: num, beat_value: den }).setMode(VF.Voice.Mode.SOFT);

            const voices = [];
            if (trebleNotes.length > 0) { vTreble.addTickables(trebleNotes); voices.push(vTreble); }
            if (bassNotes.length > 0) { vBass.addTickables(bassNotes); voices.push(vBass); }

            if (measure.directive) {
              const targetNotes = trebleNotes.length ? trebleNotes : bassNotes;
              const lastNote = targetNotes[targetNotes.length - 1];
              if (lastNote) {
                try { lastNote.addModifier(new VF.Annotation(measure.directive).setFont("Times", 12, "italic bold").setVerticalJustification(3).setJustification(2).setYShift(15), 0); } catch(e) {}
              }
            }

            if (voices.length > 0) {
              const innerWidth = width - noteStartOffset - 15;
              const formatter = new VF.Formatter();
              try { formatter.joinVoices(voices).format(voices, innerWidth); } 
              catch { voices.forEach(v => new VF.Formatter().joinVoices([v]).format([v], innerWidth)); }
            }
            
            if (trebleNotes.length > 0) { vTreble.draw(ctx, staveTreble); trebleBeams.forEach(b => b.setContext(ctx).draw()); }
            if (bassNotes.length > 0) { vBass.draw(ctx, staveBass); bassBeams.forEach(b => b.setContext(ctx).draw()); }
          } catch (measureErr) {
            console.error(`Render Error (Measure ${idx + 1}):`, measureErr);
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
        svg.setAttribute("viewBox", `0 0 ${RENDER_CFG.TOTAL_WIDTH} ${pageHeight}`);
        svg.removeAttribute("width"); svg.removeAttribute("height");
        
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
    }

    const needed = measureNeededQuarters(timeSig), m = measures[state.editorState.activeMeasure], lbl = document.getElementById("activeMeasureLabel");
    if (lbl) lbl.textContent = `${state.editorState.activeMeasure + 1}/${measures.length} · ♩ Sol ${trim(quartersUsed(m.treble))}/${trim(needed)} · Fa ${trim(quartersUsed(m.bass))}/${trim(needed)}`;
  } catch (err) {
    console.error(err);
    container.innerHTML = '<p style="padding:40px;color:var(--color-danger);font-weight:bold;">Render Error.</p>';
  }
}