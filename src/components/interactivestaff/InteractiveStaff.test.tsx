import React from 'react'
import {InteractiveStaff} from "@/components/interactivestaff/InteractiveStaff";
import {render, screen, waitFor} from "@testing-library/react-native";
import {Chord} from "@/lib/music/Chord";
import {toNote} from "@/lib/music/Note";

describe('an interactive staff', () => {
  it('should render', () => {
    render(<InteractiveStaff/>)
  })

  it.skip('should render chord symbols', async () => {
    const chords = [
      new Chord('C', 'Major'),
      new Chord('D', 'Minor'),
      new Chord('G', 'Major'),
      new Chord('C', 'Major'),
    ]

    render(<InteractiveStaff chords={chords}/>)

    await waitFor(() => {
      expect(screen.getByText(/Dm/)).toBeOnTheScreen()
      expect(screen.getByText(/G/)).toBeOnTheScreen()
      expect(screen.getAllByText(/C/).length).toBe(2)
    })
  })

  it.skip('should render chord voicings on the staff', () => {
    render(
      <InteractiveStaff chords={[new Chord('C', 'Major'), new Chord('Db', 'Major')]}
                        chordVoicings={Array.of(
                          ['C#4', 'E4', 'G4', 'C5'].map(toNote),
                        )}
      />
    )
  })
})
