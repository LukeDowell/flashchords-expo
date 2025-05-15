import {useContext, useEffect, useLayoutEffect, useRef, useState} from 'react'
import {Renderer, SVGContext} from "vexflow4";
import {Soundfont} from 'smplr'
import _ from "lodash";
import {MidiPianoContext, WebAudioContext} from "@/lib/react/contexts";
import {useWindowDimensions} from "react-native";
import ReactNativeSVGContext from "@/lib/vexflow/ReactNativeSVGContext";

export function useInterval(callback: () => void, delay: number | null) {
  const savedCallback = useRef(callback)

  // Remember the latest callback if it changes.
  useEffect(() => {
    savedCallback.current = callback
  }, [callback])

  // Set up the interval.
  useEffect(() => {
    // Don't schedule if no delay is specified.
    // Note: 0 is a valid value for delay.
    if (!delay && delay !== 0) {
      return
    }
    const id = setInterval(() => {
      savedCallback.current()
    }, delay)
    return () => clearInterval(id)
  }, [delay])
}

// https://gist.github.com/gaearon/e7d97cdf38a2907924ea12e4ebdf3c85?permalink_comment_id=3570933#gistcomment-3570933
// https://gist.github.com/gaearon/e7d97cdf38a2907924ea12e4ebdf3c85?permalink_comment_id=3570933#gistcomment-3570933
export const useSSRLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : () => {
}

export function useVexflowContext(widthOverride?: number, heightOverride?: number): { context?: ReactNativeSVGContext, width: number, height: number} {
  const [context, setContext] = useState<ReactNativeSVGContext | undefined>(undefined)
  const [size, setSize] = useState<[number, number]>([0, 0])
  const {width, height} = useWindowDimensions()

  useEffect(() => {
    const ctx = new ReactNativeSVGContext({width, height})
    const renderer = new Renderer(ctx)
    const contextWidth = widthOverride ? widthOverride : width
    const contextHeight = heightOverride ? heightOverride : height

    renderer.resize(contextWidth, contextHeight)

    setContext(ctx)
    setSize([contextWidth, contextHeight])
  }, [width, height, widthOverride, heightOverride])

  return {
    context,
    width,
    height
  }
}

// https://github.com/joshwcomeau/use-sound/issues/22#issuecomment-737727148
const events = ['mousedown', 'touchstart', 'keydown', 'mousemove'];

export function useInteraction() {
  const [ready, setReady] = useState(false)
  const listener = useRef(() => {
    if (!ready) setReady(true)
  })

  useEffect(() => {
    if (!ready) events.forEach((event) => document.addEventListener(event, listener.current))
    else events.forEach((event) => document.removeEventListener(event, listener.current))
  }, [ready]);

  return ready;
}

export function useAudio(): AudioContext | undefined {
  const [audio, setAudio] = useState<AudioContext>()
  const interacted = useInteraction()

  useSSRLayoutEffect(() => {
    const create = async () => new AudioContext()
    if (interacted) create().then(setAudio)
  }, [interacted])

  return audio
}

export function useInstrument(sample = 'electric_grand_piano', listenToMidi?: boolean) {
  const [instrument, setInstrument] = useState<Soundfont | undefined>(undefined)
  const audioContext = useContext(WebAudioContext)
  const piano = useContext(MidiPianoContext)

  useSSRLayoutEffect(() => {
    if (!audioContext || !piano) return
    const player = new Soundfont(audioContext, {instrument: sample})
    const listenerId = _.uniqueId(`instrument-${sample}`)

    if (listenToMidi) {
      piano.addSubscriber(listenerId, (noteEvent) => {
        const {note, midiNote, velocity, flag, time} = noteEvent
        switch (flag) {
          case "keydown":
            audioContext.resume().then(() => player.start({note: midiNote, velocity}))
            break
          case "keyup":
            player.stop({stopId: midiNote})
            break
        }
      })
    }

    setInstrument(player)
    return () => {
      piano.removeSubscriber(listenerId)
      setInstrument(undefined)
    }
  }, [sample, audioContext, piano])

  return instrument
}
