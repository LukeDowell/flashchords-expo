import {fillWithRests, splitIntoMeasures} from "@/lib/vexMusic";
import {render} from "@testing-library/react";
import _ from "lodash";
import {renderVex} from "@/lib/vexRenderer";

describe('vex music', () => {
  it('should place a list of notes into evenly divided measures', () => {
    const input = 'C2/q, D2, E2, F2, G2, A2, B2, C3, D3'
    const measures = splitIntoMeasures(input)

    // expect(measures.length).toBe(3)
    expect(measures[0]).toBe('C2/q, D2, E2, F2')
    expect(measures[1]).toBe('G2, A2, B2, C3')
    expect(measures[2]).toBe('D3, C4/h/r, C4/q/r')
  })

  test.each([
    ["", "/w/r"],
  ])(
    `%s measure should be filled with an %s rest`,
    (input: string, expectedRests: string) => expect(fillWithRests(input).includes('')).toBeTruthy()
  )

  // it('should correctly get notes at each tickable', () => {
  //   const elementId = _.uniqueId('element-id')
  //   render(<div id={elementId} />)
  //   const { vexMeasures, context, allElements } = renderVex(elementId, {
  //     trebleVoice: 'C4/w, ' + 'Ab4/w, ' + 'F#4/w',
  //     bassVoice: 'C3/q, E3/q, G3/q, B3/q, ' + 'Ab3/8, C4/8, Eb4/q, G4/h, ' + 'F#3/w'
  //   })
  //
  //   expect(getNotesAtTickable(vexMeasures, 0, 0)).toBe(['C4/w', 'C3/q'])
  //   // expect(getNotesAtTickable(vexMeasures, 0, 1)).toBe(['C4/w', 'E3/q'])
  //   // expect(getNotesAtTickable(vexMeasures, 0, 2)).toBe(['C4/w', 'G3/q'])
  //   // expect(getNotesAtTickable(vexMeasures, 0, 3)).toBe(['C4/w', 'B3/q'])
  //   //
  //   // expect(getNotesAtTickable(vexMeasures, 1, 0)).toBe(['Ab4/w', 'Ab3/8'])
  //   // expect(getNotesAtTickable(vexMeasures, 1, 1)).toBe(['Ab4/w', 'C4/8'])
  //   // expect(getNotesAtTickable(vexMeasures, 1, 2)).toBe(['Ab4/w', 'Eb4/q'])
  //   // expect(getNotesAtTickable(vexMeasures, 1, 3)).toBe(['Ab4/w', 'G4/h'])
  //   //
  //   // expect(getNotesAtTickable(vexMeasures, 2, 0)).toBe(['F#4/w', 'F#3/w'])
  //
  //   // TODO tuplets
  // })
})
