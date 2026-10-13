import { useEffect, useRef } from "react";
import * as echarts from "echarts";

const SafeEChart = ({ option, style }) => {
  const hostRef = useRef(null);
  const chartRef = useRef(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return undefined;

    const chart = echarts.init(host, null, { renderer: "svg" });
    chartRef.current = chart;

    const observer = new ResizeObserver(() => {
      if (!chart.isDisposed()) chart.resize();
    });
    observer.observe(host);

    return () => {
      observer.disconnect();
      chartRef.current = null;
      if (!chart.isDisposed()) chart.dispose();
    };
  }, []);

  useEffect(() => {
    const chart = chartRef.current;
    if (!chart || chart.isDisposed() || !option) return;
    chart.setOption(option, { notMerge: true, lazyUpdate: true });
  }, [option]);

  return <div ref={hostRef} style={style} />;
};

export default SafeEChart;
