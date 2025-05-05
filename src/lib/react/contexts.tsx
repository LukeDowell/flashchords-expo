import {createContext} from "react";
import MidiPiano from "@/lib/music/MidiPiano";
import { MIDIInput} from "react-native-midi";

export const MidiPianoContext = createContext(undefined as MidiPiano | undefined)
export const MidiInputContext = createContext(undefined as MIDIInput | undefined)
export const WebAudioContext = createContext<AudioContext | undefined>(undefined)
export const InstrumentContext = createContext<string>("electric_grand_piano")
