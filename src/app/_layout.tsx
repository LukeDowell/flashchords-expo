import {useFonts} from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import 'react-native-reanimated';
import {useColorScheme} from '@/hooks/useColorScheme';
import PracticePage from "@/components/pages/practice/PracticePage";
import {useEffect, useState} from "react";
import MidiPiano from "@/lib/music/MidiPiano";
import {InstrumentContext, MidiInputContext, MidiPianoContext} from '@/lib/react/contexts';
import {requestMIDIAccess} from "@motiz88/react-native-midi"

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('@/assets/fonts/SpaceMono-Regular.ttf'),
  });
  const [midiPiano, setMidiPiano] = useState<MidiPiano>(new MidiPiano())
  const [midiContext, setMidiContext] = useState<WebMidi.MIDIInput | undefined>(undefined)
  const [selectedInput, setSelectedInput] = useState<string>('')
  const [inputs, setInputs] = useState<WebMidi.MIDIInput[]>([])
  const [sample, setSample] = useState('electric_grand_piano')
  const inputIds = inputs.map(i => i.id).sort() // MIDIInputs are complex objects, and the useEffect equality check gets messed up

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  useEffect(() => {
    const abortController = new AbortController()
    requestMIDIAccess().then((midiAccess) => {
      midiAccess.addEventListener(
        'statechange',
        (connectionEvent: WebMidi.MIDIConnectionEvent) => {
          console.log('connectionEvent', connectionEvent)
          setSelectedInput('')
          setInputs([])
        },
        {signal: abortController.signal}
      )
    })
    return () => abortController.abort('cleanup')
  }, [])

  useEffect(() => {
    requestMIDIAccess().then((midiAccess) => {
      const tempInputs: WebMidi.MIDIInput[] = []
      for (let [id, input] of midiAccess.inputs) {
        tempInputs.push(input)
      }

      setInputs(tempInputs)
      if (selectedInput === '' && tempInputs.length > 0) {
        // handleInputSelected(tempInputs[0].name || tempInputs[0].id)
        const selectedName = tempInputs[0].name || tempInputs[0].id
        let inputProbably = Array.from(inputs).find((input) => input.name === selectedName)
        if (inputProbably === undefined) {
          inputProbably = Array.from(inputs).find((input) => input.id === selectedName)
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
        <InstrumentContext.Provider value={sample}>
          <PracticePage />
        </InstrumentContext.Provider>
      </MidiInputContext.Provider>
    </MidiPianoContext.Provider>
  );
}
