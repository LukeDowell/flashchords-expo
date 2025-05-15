import {useVexflowContext} from "@/lib/react/hooks";
import styled from "@emotion/native"
import {renderVex} from "@/lib/vexRenderer";
import {useEffect} from "react";
import {interpolateColor, useAnimatedStyle, useSharedValue, withTiming} from "react-native-reanimated";

interface Props {

}

const ViewRoot = styled.View`
    display: flex;
    width: 100%;
    height: 100%;
`
export default function NativeExercise(props: Props) {
  const vexflowContext = useVexflowContext()
  const { context, vexMeasures, allElements } = renderVex({
    width: vexflowContext.width,
    height: vexflowContext.height,
    context: vexflowContext.context,
    trebleVoice: "C4/q, E4/q, G4/q, B4/q",
  })

  const sv = useSharedValue(0)
  const runAnimation = () => { sv.value = withTiming(sv.value ? 0 : 1) };
  const animatedStyle = useAnimatedStyle(() => {
    return {
      color: interpolateColor(sv.value, [0, 1], ['blue', 'violet']),
    }
  })

  useEffect(() => {
    runAnimation()
  }, []);

  useEffect(() => {
    if (!context || allElements.childElementCount <= 0) return

    // TODO trying to animate here, ideally in response to some piano MIDI input
  }, [context, allElements]);

  return <ViewRoot>
    { context ? context.render() : false }
  </ViewRoot>
}
