import * as VF from 'vexflow';
import { state } from '../core/state.js';
import { t } from '../ui/i18n.js';
import { persistScore, measureNeededQuarters, quartersUsed, escapeHtml, plateLabel, trim } from '../core/storage.js';
import { emit } from '../core/events.js';

const RENDER_CFG = {
  MEASURES_PER_LINE: 4,
  LINES_PER_PAGE: 4,
  TOTAL_WIDTH: 1020,
  LEFT_MARGIN: 40,
  FIRST_LINE_WIDTH: 330,
  REST_LINE_WIDTH: 200,
  STAVE_GAP: 110,
  LINE_GAP: 220,
  TOP_MARGIN: 20
};

const noteToVexKey = (n) => `${n.letter.toLowerCase()}${n.accidental === "#" || n.accidental === "b" ? n.accidental : ""}/${n.octave}`;

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
        const composersHtml = (score.composer || "").split(",").map(c => `<span>${escapeHtml(c.trim())}</span>`).join(" &middot; ");
        head.innerHTML = `<h2>${escapeHtml(score.title || t("untitled"))}</h2><p>${composersHtml}</p>`;
        pageDiv.appendChild(head);
        startY += 85;
      }

      const svgWrap = document.createElement("div");
      pageDiv.appendChild(svgWrap);

      const printFooter = document.createElement("div");
      printFooter.className = "print-footer-content";
      printFooter.innerHTML = `<span style="display:flex; align-items:center; gap:10px;"><img src="assets/isotipo-w.png" class="print-logo-isotipo"> <strong>${plateLabel(score.plate)}</strong></span> <span>${p + 1} / ${totalPages}</span>`;
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
            staveTreble.addClef("treble");
            staveBass.addClef("bass");
            if (keySig && keySig !== "C") {
              staveTreble.addKeySignature(keySig);
              staveBass.addKeySignature(keySig);
            }
          }

          if (idx === 0) {
            staveTreble.addTimeSignature(timeSig);
            staveBass.addTimeSignature(timeSig);
            staveTreble.setTempo({ duration: "q", dots: 0, bpm: bpm || 100 }, 0);
          }

          const noteStartOffset = isFirstOfLine ? 120 : 15;
          staveTreble.setNoteStartX(x + noteStartOffset);
          staveBass.setNoteStartX(x + noteStartOffset);

          staveTreble.setBegBarType(measure.repeatStart ? VF.Barline.type.REPEAT_BEGIN : VF.Barline.type.SINGLE);
          staveBass.setBegBarType(measure.repeatStart ? VF.Barline.type.REPEAT_BEGIN : VF.Barline.type.SINGLE);
          
          let endType = VF.Barline.type.SINGLE;
          if (measure.repeatEnd) endType = VF.Barline.type.REPEAT_END;
          else if (measure.directive === "Fine") endType = VF.Barline.type.DOUBLE; 
          else if (measure.directive && /D\.(C|S)\./.test(measure.directive)) endType = VF.Barline.type.END;
          else if (idx === measures.length - 1) endType = VF.Barline.type.END;
          
          staveTreble.setEndBarType(endType);
          staveBass.setEndBarType(endType);
          staveTreble.setContext(ctx).draw();
          staveBass.setContext(ctx).draw();

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
              const keys = n.rest ? [clef === "bass" ? "d/3" : "b/4"] : [noteToVexKey(n)];
              const sn = new VF.StaveNote({ clef, keys, duration: durStr, auto_stem: true });
              
              sn.setAttribute("id", `vf-note-${idx}-${staffName}-${nIdx}`);
              if (n.dotted) VF.Dot.buildAndAttach([sn], { all: true });
              if (!n.rest && n.accidental) sn.addModifier(new VF.Accidental(n.accidental), 0);
              
              if (n.lyric) {
                  sn.addModifier(new VF.Annotation(n.lyric).setFont("Times", 12).setVerticalJustification(3), 0);
              }
              if (n.fingering) {
                  sn.addModifier(new VF.FretHandFinger(n.fingering).setPosition(3), 0);
              }
              if (n.dynamic) {
                sn.addModifier(
                  new VF.Annotation(n.dynamic)
                    .setFont("Times", 12, "italic bold")
                    .setVerticalJustification(clef === "bass" ? 4 : 3),
                  0
                );
              }
              return sn;
            });
          };

          try {
            const trebleNotes = buildNotes(measure.treble, "treble", "treble");
            const bassNotes = buildNotes(measure.bass, "bass", "bass");

            const vTreble = new VF.Voice({ num_beats: num, beat_value: den }).setMode(VF.Voice.Mode.SOFT);
            const vBass = new VF.Voice({ num_beats: num, beat_value: den }).setMode(VF.Voice.Mode.SOFT);

            const voices = [];
            if (trebleNotes.length > 0) { vTreble.addTickables(trebleNotes); voices.push(vTreble); }
            if (bassNotes.length > 0) { vBass.addTickables(bassNotes); voices.push(vBass); }

            if (measure.directive) {
              const targetNotes = trebleNotes.length ? trebleNotes : bassNotes;
              const lastNote = targetNotes[targetNotes.length - 1];
              if (lastNote) {
                lastNote.addModifier(
                  new VF.Annotation(measure.directive)
                    .setFont("Times", 13, "italic bold")
                    .setVerticalJustification(1),
                  0
                );
              }
            }

            if (voices.length > 0) {
              const innerWidth = width - noteStartOffset - 15;
              const formatter = new VF.Formatter();
              try {
                formatter.joinVoices(voices).format(voices, innerWidth);
              } catch {
                voices.forEach((v) => new VF.Formatter().joinVoices([v]).format([v], innerWidth));
              }
            }
            
            if (trebleNotes.length > 0) {
              try { VF.Beam.generateBeams(trebleNotes).forEach(b => b.setContext(ctx).draw()); } catch {}
              vTreble.draw(ctx, staveTreble);
            }

            if (bassNotes.length > 0) {
              try { VF.Beam.generateBeams(bassNotes).forEach(b => b.setContext(ctx).draw()); } catch {}
              vBass.draw(ctx, staveBass);
            }
          } catch (measureErr) {
            console.error(`Render Error (Measure ${idx + 1}):`, measureErr);
            const errText = document.createElementNS("http://www.w3.org/2000/svg", "text");
            errText.setAttribute("x", x + 10);
            errText.setAttribute("y", yTreble + 20);
            errText.setAttribute("fill", "var(--color-danger)");
            errText.setAttribute("font-size", "11");
            errText.textContent = `⚠ Error M${idx + 1}`;
            ctx.svg.appendChild(errText);
          }

          const hitX = staveTreble.getNoteStartX() - 8;
          const hitRight = staveTreble.getX() + staveTreble.getWidth(); 
          
          hitRects.push({
            x: hitX, y: staveTreble.getYForLine(0) - 35,
            width: hitRight - hitX, height: staveBass.getYForLine(4) - staveTreble.getYForLine(0) + 70,
            startX: hitX + 8, endX: staveTreble.getNoteEndX(), idx
          });
        }
      }

      const svg = svgWrap.querySelector("svg");
      if (svg) {
        svg.setAttribute("viewBox", `0 0 ${RENDER_CFG.TOTAL_WIDTH} ${pageHeight}`);
        svg.removeAttribute("width");
        svg.removeAttribute("height");
        
        const ns = "http://www.w3.org/2000/svg";
        hitRects.forEach((hr) => {
          const g = document.createElementNS(ns, "g");
          g.setAttribute("class", `measure-hit${hr.idx === state.editorState.activeMeasure ? " active" : ""}`);
          g.setAttribute("data-measure-idx", hr.idx);
          g.setAttribute("data-start-x", hr.startX);
          g.setAttribute("data-end-x", hr.endX);
          g.setAttribute("data-y", hr.y);
          g.setAttribute("data-h", hr.height);

          const rect = document.createElementNS(ns, "rect");
          rect.setAttribute("x", hr.x); rect.setAttribute("y", hr.y);
          rect.setAttribute("width", hr.width); rect.setAttribute("height", hr.height);
          rect.setAttribute("fill", hr.idx === state.editorState.activeMeasure ? "rgba(179, 142, 80, 0.15)" : "transparent");
          rect.setAttribute("rx", "4");
          
          g.appendChild(rect);
          g.addEventListener("click", () => {
            state.editorState.activeMeasure = hr.idx;
            emit("measureselected", hr.idx);
            renderScore();
          });
          svg.appendChild(g);
        });
      }
    }

    const needed = measureNeededQuarters(timeSig);
    const m = measures[state.editorState.activeMeasure];
    const lbl = document.getElementById("activeMeasureLabel");
    
    if (lbl) {
      lbl.textContent = `${state.editorState.activeMeasure + 1}/${measures.length} · ♩ Sol ${trim(quartersUsed(m.treble))}/${trim(needed)} · Fa ${trim(quartersUsed(m.bass))}/${trim(needed)}`;
    }
  } catch (err) {
    console.error(err);
    container.innerHTML = '<p style="padding:40px;color:var(--color-danger);font-weight:bold;">Render Error.</p>';
  }
}