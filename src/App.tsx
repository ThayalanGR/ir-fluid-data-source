import { Fragment, useCallback, useEffect, useRef, useState } from "react";
import "./styles.css";
import FluidDataSourceService from "./FluidDataSourceService";

export type TLog = (...data: unknown[]) => void;

export default function App() {
  // state
  const [logs, setLogs] = useState<unknown[]>(["Initiating tests..."]);

  // refs
  const logTimerRef = useRef(0);
  const codeContainerRef = useRef<HTMLDivElement>(null);

  // handlers
  const log = useCallback(
    (...data: unknown[]) => {
      setTimeout(() => {
        setLogs((state) => [
          ...state,
          ...data.map((item) =>
            typeof item === "object" ? JSON.stringify(item) : item
          ),
        ]);
      }, (logTimerRef.current += 1000));
    },
    [setLogs]
  );

  // effects
  useEffect(() => {
    const fluidDataSourceService = FluidDataSourceService.getInstance(log);
    fluidDataSourceService.parseData().then(() => {
      fluidDataSourceService.mapData({
        categoryKeys: ["segment"],
        valueKeys: ["sales", "profit"],
      });
      fluidDataSourceService.mapData({
        categoryKeys: ["year"],
        valueKeys: ["sales", "profit"],
      });
      fluidDataSourceService.mapData({
        categoryKeys: ["segment", "quarter"],
        valueKeys: ["sales", "profit"],
      });
      fluidDataSourceService.mapData({
        categoryKeys: ["region", "year"],
        valueKeys: ["profit", "sales"],
      });
    });
  }, [log]);

  useEffect(() => {
    codeContainerRef.current?.scrollTo({
      top:
        codeContainerRef.current.scrollHeight -
        codeContainerRef.current.offsetHeight -
        codeContainerRef.current.clientHeight * 0.35,
    });
  }, [logs]);

  // paint
  return (
    <div className="App">
      <h1>Fluid Data Source Assigment Test Tool</h1>

      <div className="code" ref={codeContainerRef}>
        {logs.map((item, key) => (
          <Fragment key={key}>
            <code>
              <>=&gt;&nbsp;{item}</>
            </code>
            <br />
          </Fragment>
        ))}
        <div className="scroll-space" />
      </div>
    </div>
  );
}
