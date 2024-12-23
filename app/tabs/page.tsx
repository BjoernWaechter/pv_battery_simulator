'use client'

import React, { CSSProperties, Dispatch, SetStateAction, useState } from 'react';


import { useCSVReader } from 'react-papaparse';
import * as d3 from 'd3'
// import RangeSlider from 'react-bootstrap-range-slider';

import {AggData, import_raw_csv, BatteryData, CleanedRawData} from '../data_processing'

 
import styled from "styled-components";
import TimeGraph from '../components/TimeGraph/TimeGraph';

 const styles = {
  csvReader: {
    display: 'flex',
    flexDirection: 'row',
    marginBottom: 10,
  } as CSSProperties,
  browseFile: {
    width: '200px',
  } as CSSProperties,
  acceptedFile: {
    border: '1px solid #ccc', 
    height: 45,
    lineHeight: 2.5,
    paddingLeft: 10,
    margin_right: "auto",
    left: 10,
    width: '250px',
  } as CSSProperties,
  remove: {
    borderRadius: 0,
    padding: '0 20px',
  } as CSSProperties,
  progressBarBackgroundColor: {
    backgroundColor: 'grey',
  } as CSSProperties,
  displayLinebreak: {
    whiteSpace: "pre-line",
  } as CSSProperties,
  importMessage: {
    border: '', 
    height: "70px",
    paddingLeft: "20px",
    whiteSpace: "pre-line",
  } as CSSProperties,
  resultMessage: {
    border: '', 
    height: "70px",
    paddingLeft: "20px",
    paddingTop: "20px",
    whiteSpace: "pre-line",
  } as CSSProperties,
};

const theme = {
  blue: {
    default: "#3f51b5",
    hover: "#283593",
  },
  pink: {
    default: "#e91e63",
    hover: "#ad1457",
  },
};

const Button = styled.button`
  background-color: ${(props) => theme["blue"].default};
  color: white;
  padding: 5px 15px;
  border-radius: 5px;
  outline: 0;
  border: 0; 
  width: 220px;
  cursor: pointer;
  box-shadow: 0px 2px 2px lightgray;
  transition: ease background-color 250ms;
  &:hover {
    background-color: ${(props) => theme["blue"].hover};
  }
  &:disabled {
    cursor: default;
    opacity: 0.7;
  }
`;



export default function ImportRawData() {

  const raw_data: CleanedRawData = {
    date: 0,
    human_day: "2024-01-01",
    raw_month: "2024-01",
    iso_month: "2024-01-01",
    raw_day: "2024-01-01",
    in: 0,
    out: 0,
  };
  const [data, setRawData] = useState([raw_data])

  const agg_data: AggData = {
    date: 0,
    human_day: "",
    in_sum: 0,
    out_sum: 0
  };
  const [data_agg, setAggData] = useState([agg_data])

  const bat_data: BatteryData = {
    date: 0,
    human_day: "",
    soc5: 0,
    soc10: 0,
    soc15: 0
  };
  const [data_battery, setBatteryData] = useState([bat_data])

  
  const { CSVReader } = useCSVReader();


  const [errorMessage, setErrorMessage] = useState('');
  const [resultMessage, setResultMessage] = useState('');
  const [importMessage, setImportMessage] = useState('\u2754 Input energy data ...\n\u2754 Output energy data ...');

  // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
  const msgSetter: { [name: string] : Dispatch<SetStateAction<string>>; } = {};
  msgSetter["error"] = setErrorMessage;
  msgSetter["result"] = setResultMessage;
  msgSetter["import"] = setImportMessage;

  // const [ value, setValue ] = useState(0);

  return (
    <>
    <CSVReader
// eslint-disable-next-line
      onUploadAccepted={(results: any) => {

        import_raw_csv(results, "in", setRawData, setAggData, setBatteryData, msgSetter)
        
      }}
    >
      {({
        getRootProps,
        acceptedFile,
        ProgressBar,
// eslint-disable-next-line
      }: any) => (
        <>
          <div style={styles.csvReader}>
           
            <Button type='button' {...getRootProps()}>
             Input energy - Open file
            </Button>
            <div style={styles.acceptedFile}>
              {acceptedFile && acceptedFile.name}
            </div>
          </div>
          <ProgressBar style={styles.progressBarBackgroundColor} />
        </>
      )}
    </CSVReader>
    <CSVReader
// eslint-disable-next-line
      onUploadAccepted={(results: any) => {
        import_raw_csv(results, "out", setRawData, setAggData, setBatteryData, msgSetter)
      }
      }
    >
      {({
        getRootProps,
        acceptedFile,
        ProgressBar,
// eslint-disable-next-line
      }: any) => (
        <>
          <div style={styles.csvReader}>
            <Button type='button' {...getRootProps()} >
              Output energy - Open file
            </Button>
            <div style={styles.acceptedFile}>
              {acceptedFile && acceptedFile.name}
            </div>
          </div>
          <ProgressBar style={styles.progressBarBackgroundColor} />
        </>
      )}
    </CSVReader>
    {/* <RangeSlider
      value={value}
      min={0}
      max={30}
      onChange={changeEvent => setValue(changeEvent.target.value)}
    /> */}

    <div>
    {importMessage && (
      <p className="saving_result" style={styles.importMessage}> {importMessage} </p>
    )}
    </div>
    
    {errorMessage && (
      <p className="error"> {errorMessage} </p>
    )}

    <TimeGraph id="daily_graph"   data={data_agg}     height={300} minWidth={350} lines={[
      {name:"Täglicher Verbauch [kwh]", dataKey:"in_sum", dot:true },
      {name:"Tägliche Einspeisung [kwh]", dataKey:"out_sum", dot:true }
      ]} />
    <TimeGraph id="battery_graph" data={data_battery} height={300} minWidth={350} lines={[
      {name:"SOC 5kwh [kwh]", dataKey:"soc5", dot:false},
      {name:"SOC 10kwh [kwh]", dataKey:"soc10", dot:false},
      {name:"SOC 15kwh [kwh]", dataKey:"soc15", dot:false}
      ]} />
    {resultMessage && (
      <p className="saving_result" style={styles.resultMessage}> {resultMessage} </p>
    )}

    </>
   )

 }