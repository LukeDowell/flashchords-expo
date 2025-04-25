import {Renderer, Stave, StemmableNote, SVGContext, Voice, Factory} from "vexflow";
import {splitIntoMeasures} from "@/lib/vexMusic";
import _ from "lodash";

/**
 * @param width TODO what does width mean to vexflow? Max width? width-per-something?
 * @param trebleVoices An array of unbroken easyscore strings that contain durations. These will be automatically
 *                     broken up and placed into measures, with the last measure being filled with any rests as
 *                     necessary. These notes will be formatted to a treble stave.
 * @param bassVoices Same as trebleVoices, but will be formatted to a bass stave.
 */
interface RenderVexConfig {
  width?: number
  trebleVoice?: string
  bassVoice?: string
}

export interface VexMeasure {
  index: number,
  clef: 'treble' | 'bass',
  stave: Stave,
  notes: StemmableNote[],
  voice: string,
  vexVoice: Voice
}

/**
 * @param elementId the id of an HTML element in which the music content will be rendered
 * @param config
 */
export function renderVex(elementId: string, config: RenderVexConfig = {}): { vexMeasures: VexMeasure[], context: SVGContext, allElements: SVGElement } {
  const vexWidth = config.width || 400
  const trebleVoice = config.trebleVoice || ""
  const bassVoice = config.bassVoice || ""

  if (trebleVoice.length === 0 && bassVoice.length === 0) {
    throw new Error("You need to have at least one voice in order to render!")
  }

  // Wipe the current score
  const outputDiv = document.getElementById(elementId) as HTMLDivElement
  if (outputDiv) outputDiv.innerHTML = ''

  const vf = new Factory({
    renderer: {
      backend: Renderer.Backends.SVG, elementId: elementId, width: vexWidth, height: 800
    },
    stave: {
      space: 12
    }
  })
  const score = vf.EasyScore()
  const formatter = vf.Formatter()

  const trebleMeasures = trebleVoice.length > 0 ? splitIntoMeasures(trebleVoice) : []
  const bassMeasures = bassVoice.length > 0 ? splitIntoMeasures(bassVoice) : []
  const vexMeasures: VexMeasure[] = []

  const allElementsGroup = vf.getContext().openGroup('vex-renderer-elements')
  _.zip(trebleMeasures, bassMeasures).forEach(([trebleMeasure, bassMeasure], i) => {
    const system = vf.System({
      x: i * 300,
      width: 300,
      y: 100,
      formatOptions: {
        alignRests: true,
        autoBeam: true
      },
      debugFormatter: true,
    })

    if (trebleMeasure && trebleMeasure.length > 0) addVoice(trebleMeasure, 'treble')
    if (bassMeasure && bassMeasure.length > 0) addVoice(bassMeasure, 'bass')

    function addVoice(voice: string, clef: 'treble' | 'bass') {
      let notes: StemmableNote[]
      if (['8', '16', '32'].some((d) => voice.includes(d))) {
        notes = score.beam(score.notes(voice, {clef}), { autoStem: true })
      } else {
        notes = score.notes(voice, {clef})
      }

      const easyScoreVoice = score.voice(notes)
      const stave = system.addStave({voices: [easyScoreVoice]})
        // .setMeasure(i) // TODO causes problem with test for some reason

      if (i === 0) {
        stave.addClef(clef).addTimeSignature('4/4')
      }

      vexMeasures.push({ index: i, notes: notes, stave, voice, clef, vexVoice: easyScoreVoice })
      try {
        formatter.joinVoices([easyScoreVoice])
      } catch (e) {
        console.error(`problem trying to format voice ${voice}`, e)
      }
    }

    if (i === 0) {
      system.addConnector()
    }
  })

  const debugDraw = () => {
    vexMeasures.forEach((vm) => {
      const s = vm.stave
      vf.getContext().fillText(`${s.getX()}`, s.getX(), s.getY())
    })
  }
  debugDraw()

  vf.draw()
  vf.getContext().closeGroup()

  return { vexMeasures, context: vf.getContext() as SVGContext, allElements: allElementsGroup }
}
