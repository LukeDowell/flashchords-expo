import React from 'react'
import styled from '@emotion/native'
import {KEYBOARD, Note, SHARP} from "@/lib/music/Note";

interface Props {
  activeNotes: Note[],
}

const Key = styled.View`
  display: flex;
  width: 35px;
  height: 100%;
  background-color: white;
  color: grey;
  border: 1px solid black;
  align-items: end;
  justify-content: center;
`

const BlackKey = styled(Key)`
  height: 50%;
  background-color: black;
  width: 28px;
`

const StyledKeyboard = styled.View`
  display: flex;
  flex-direction: row;
  justify-content: space-around;
  align-content: flex-start;
  height: 250px;
  width: 100%;
  border: 4px solid grey;
  background-color: slategray;
`

const SpookyNoWidthFloat = styled.View`
  display: inline-block;
  width: 0;
  z-index: 2;
  position: relative;
  left: -16px;
`

export const Keyboard = ({activeNotes}: Props) => {
  const keys = KEYBOARD.map((note) => {
    const activeStyle = activeNotes.includes(note) ? {
      backgroundColor: "lightblue"
    } : {}

    return note.accidental?.symbol === SHARP.symbol ?
      <SpookyNoWidthFloat key={note.toString()}>
        <BlackKey style={activeStyle}>{note.toString()}</BlackKey>
      </SpookyNoWidthFloat>
      : <Key key={note.toString()} style={activeStyle}>{note.toString()}</Key>
  })

  return <StyledKeyboard>{keys}</StyledKeyboard>
}
