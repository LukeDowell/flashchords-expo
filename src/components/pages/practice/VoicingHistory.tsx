import * as React from 'react'
import styled from "@emotion/native"
import {NATURAL, Note} from "@/lib/music/Note";
import {MusicKey, notesInKey} from "@/lib/music/Circle";
import {Chord} from "@/lib/music/Chord";

const StyledRoot = styled.View`
  display: flex;
  flex-direction: column;
  width: 80%;
  min-width: 80%;
`

const TitleText = styled.Text`
    text-align: left;
    flex: 1;
    font-size: 3vmax;
`

const Header = styled.View`
    display: flex;
    flex-direction: row;
    align-items: flex-start;
    padding-bottom: .5rem;
    padding-left: 1rem
`

const Voicings = styled.View`
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: center;
    font-size: 2.5vmax;
`

const StyledVoicingRoot = styled.View`
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
  width: 100%;
  border-top: 2px solid black;
`

const VoicingChord = styled.View`
    flex: 1;
    text-align: left;
    padding-left: 1rem;
`

const VoicingNotes = styled.View`
    flex: 1;
    text-align: left;
`

export interface VoicingResult {
  chord: Chord,
  key: MusicKey,
  validNotes: Note[]
}

interface Props {
  voicingResults: VoicingResult[]
}

const toVoicingComponent = (v: VoicingResult, i: number) => {
  const notes = notesInKey(v.chord.notes(), v.key)
  const prettyNotes = notes.map(n => new Note(n.root, n.accidental))
    .map(n => n.toString().replace(NATURAL.symbol, ''))
    .join(', ')
  const isSuccess = v.validNotes.length > 0
  const chordSymbol = v.chord.toString()

  const Styled = styled(StyledVoicingRoot)({
    backgroundColor: isSuccess ? "rgba(0, 255, 0, 0.2)" : "rgba(255, 0, 0, 0.2)"
  })

  return <Styled key={i} data-testid={isSuccess ? `${chordSymbol}-valid-voicing` : `${chordSymbol}-invalid-voicing`}>
    <VoicingChord>{chordSymbol}</VoicingChord>
    <VoicingNotes>{prettyNotes}</VoicingNotes>
  </Styled>
}

export const VoicingHistory = ({voicingResults}: Props) => {
  const newestOnTopResults = [...voicingResults].reverse()

  return <StyledRoot>
    <Header>
      <TitleText>Chord</TitleText>
      <TitleText>Notes</TitleText>
    </Header>
    <Voicings>
      {newestOnTopResults.map(toVoicingComponent)}
    </Voicings>
  </StyledRoot>
}
