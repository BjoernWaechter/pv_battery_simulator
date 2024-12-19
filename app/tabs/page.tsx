'use client'

import React, { CSSProperties, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';


import { useCSVReader } from 'react-papaparse';
import * as d3 from 'd3'
import RangeSlider from 'react-bootstrap-range-slider';

import {AggData, import_raw_csv, CleanedRawData, fmt_human_day, new_raw, daily_agg} from '../data_processing'

 
import styled from "styled-components";

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


  const [data, setRawData] = useState([{
    date: 0,
    human_day: "2024-01-01",
    raw_month: "2024-01",
    iso_month: "2024-01-01",
    raw_day: "2024-01-01",
    in: 0,
    out: 0,
  },
  {
  date: 1,
  human_day: "2024-02-01",
  raw_month: "2024-02",
  iso_month: "2024-02-01",
  raw_day: "2024-02-01",
  in: 10,
  out: 10,
  }])

  const [data_agg, setAggData] = useState([
    {
      date: 0,
      human_day: "2024-01-01",
      in_sum: 0, 
      out_sum: 0
    }
  ])

  const [data_battery, setBatteryData] = useState([
    {
      date: 0,
      human_day: "2024-01-01",
      soc: 0
    }
  ])
  
  const { CSVReader } = useCSVReader();

  const time_fmt_human = d3.timeFormat('%Y-%m-%d %H:%M')
  const time_fmt_iso_day = d3.timeFormat('%Y-%m-%d')

  const [errorMessage, setErrorMessage] = useState('');
  const [resultMessage, setResultMessage] = useState('');
  const [importMessage, setImportMessage] = useState('\u2754 Input energy data ...\n\u2754 Output energy data ...');

  const msgSetter: { [name: string] : any; } = {};
  msgSetter["error"] = setErrorMessage;
  msgSetter["result"] = setResultMessage;
  msgSetter["import"] = setImportMessage;
  // persons["p1"] = { firstName: "F1", lastName: "L1" };
  // persons["p2"] = { firstName: "F2" }; // will result in an error


  // const [image, setImage] = useState(ImageNoInfo);


  // const {src} = useImage({
  //   srcList: '../images/no_info.png',
  // })
  const [ value, setValue ] = useState(0);


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
    <RangeSlider
      value={value}
      min={0}
      max={30}
    />

    <div>
    {importMessage && (
      <p className="saving_result" style={styles.importMessage}> {importMessage} </p>
    )}
    </div>
    
    {errorMessage && (
      <p className="error"> {errorMessage} </p>
    )}

    {/* <ResponsiveContainer minWidth={350} height={250}>
      <LineChart id="line1" data={data} margin={{ top: 5, right: 5, bottom: 15, left: 5 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis xAxisId="0" type="number" domain={['dataMin', 'dataMax']} dataKey="date" interval="preserveStart" allowDuplicatedCategory={false} tickFormatter={t => fmt_human_day(new Date(t)) } angle={-15} tickMargin={10} />
        <YAxis />
        <Tooltip labelFormatter={t => time_fmt_human(new Date(t)) } />
        <Legend verticalAlign="top" height={36}/>
        <Line name="Verbrauchte Energie [kwh]"  type="linear" isAnimationActive={false} dataKey="in"  connectNulls stroke="#BB0000" dot={false} activeDot={{ r: 6 }} />
        <Line name="Eingespeiste Energie [kwh]" type="linear" isAnimationActive={false} dataKey="out" connectNulls stroke="#00AA00" dot={false} activeDot={{ r: 6 }} />
      </LineChart>
    </ResponsiveContainer> */}
    <ResponsiveContainer minWidth={350} height={350}>
      <LineChart id="line2" data={data_agg} margin={{ top: 5, right: 5, bottom: 15, left: 5 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis xAxisId="0" dataKey="human_day" allowDuplicatedCategory={false} angle={-15} tickMargin={10} />
        <YAxis />
        <Tooltip labelFormatter={t => time_fmt_iso_day(new Date(t)) } />
        <Legend verticalAlign="top" height={36}/>
        <Line name="Täglicher Verbauch [kwh]"  dataKey="in_sum"  isAnimationActive={false} stroke="#BB0000" fill="#BB0000" />
        <Line name="Tägliche Einspeisung [kwh]" dataKey="out_sum" isAnimationActive={false} stroke="#00AA00" fill="#00AA00" />
      </LineChart>
    </ResponsiveContainer>
    <ResponsiveContainer minWidth={350} height={350}>
      <LineChart id="line3" data={data_battery} margin={{ top: 5, right: 5, bottom: 15, left: 5 }}>
        <CartesianGrid strokeDasharray="3 3" />
        {/* <XAxis xAxisId="0" dataKey="human_day" allowDuplicatedCategory={false} angle={-15} tickMargin={10} tickFormatter={t => fmt_human_day(new Date(t)) }/> */}
        <XAxis xAxisId="0" type="number" domain={['dataMin', 'dataMax']} dataKey="date" interval="preserveStart" allowDuplicatedCategory={false} tickFormatter={t => fmt_human_day(new Date(t)) } angle={-15} tickMargin={10} />
        <YAxis />
        <Tooltip labelFormatter={t => time_fmt_human(new Date(t)) } />
        <Legend verticalAlign="top" height={36}/>
        <Line name="SOC 5kwh [kwh]"  dataKey="soc5"  type="linear" isAnimationActive={false} stroke="#BB0000" dot={false}/>
        <Line name="SOC 10kwh [kwh]"  dataKey="soc10"  type="linear" isAnimationActive={false} stroke="#00AA00" dot={false}/>
        <Line name="SOC 15kwh [kwh]"  dataKey="soc15"  type="linear" isAnimationActive={false} stroke="#0000AA" dot={false}/>
      </LineChart>
    </ResponsiveContainer>

    {resultMessage && (
      <p className="saving_result" style={styles.resultMessage}> {resultMessage} </p>
    )}

    </>
   )

 }