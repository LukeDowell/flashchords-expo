import {useFonts} from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import 'react-native-reanimated';
import {useColorScheme} from '@/hooks/useColorScheme';
import PracticePage from "@/components/pages/practice/PracticePage";
import {useEffect, useState} from "react";
import MidiPiano from "@/lib/music/MidiPiano";
import {InstrumentContext, MidiInputContext, MidiPianoContext} from '@/lib/react/contexts';
import {requestMIDIAccess, MIDIConnectionEvent, MIDIInput} from "react-native-midi"
import NativeExercise from "@/components/exercises/NativeExercise";
import DiatonicChordExercise from "@/components/exercises/DiatonicChordExercise";
import {getKey} from "@/lib/music/Circle";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('@/assets/fonts/SpaceMono-Regular.ttf'),
  });
  const [midiPiano, setMidiPiano] = useState(undefined as MidiPiano | undefined)
  const [midiContext, setMidiContext] = useState(undefined as MIDIInput | undefined)
  const [selectedInput, setSelectedInput] = useState('')
  const [inputs, setInputs] = useState<MIDIInput[]>([])
  const [sample, setSample] = useState('electric_grand_piano')
  const inputIds = inputs.map(i => i.id).sort() // MIDIInputs are complex objects, and the useEffect equality check gets messed up

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  useEffect(() => {
    const abortController = new AbortController()
    console.log("Requesting midi access...")
    requestMIDIAccess().then((midiAccess) => {
      midiAccess.addEventListener(
        'statechange',
        (connectionEvent: MIDIConnectionEvent) => {
          console.log('connectionEvent', connectionEvent)
          setSelectedInput('')
          setInputs([])
        },
        {signal: abortController.signal}
      )
    }).catch((e) => console.error('Error requesting access', e))
    return () => abortController.abort('cleanup')
  }, [])

  useEffect(() => {
    requestMIDIAccess().then((midiAccess) => {
      const tempInputs: MIDIInput[] = []
      for (let [id, input] of midiAccess.inputs) {
        console.log('inputs', id, input)
        tempInputs.push(input)
      }

      setInputs(tempInputs)
      if (selectedInput === '' && tempInputs.length > 0) {
        console.log('selecting input')
        // handleInputSelected(tempInputs[0].name || tempInputs[0].id)
        const selectedName = tempInputs[0].name || tempInputs[0].id
        let inputProbably = Array.from(tempInputs).find((input) => input.name === selectedName)
        if (inputProbably === undefined) {
          inputProbably = Array.from(tempInputs).find((input) => input.id === selectedName)
          console.log('Input probably', inputProbably, selectedName)
        }
        if (inputProbably === undefined) {
          console.error('Selected ID that does not exist!')
        } else {
          setSelectedInput(selectedName)
          setMidiPiano(new MidiPiano(inputProbably))
          setMidiContext(inputProbably)
        }
      }
    })
  }, [])

  if (!loaded) {
    return null;
  }

  return (
    <MidiPianoContext.Provider value={midiPiano}>
      <MidiInputContext.Provider value={midiContext}>
        <NativeExercise />
      </MidiInputContext.Provider>
    </MidiPianoContext.Provider>
  );
}
