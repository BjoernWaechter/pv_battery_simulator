'use client'

import React, { CSSProperties, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';


import { useCSVReader } from 'react-papaparse';
import * as d3 from 'd3'

import {AggData, import_raw_csv, CleanedRawData, fmt_human_day} from './data_processing'

 

 const styles = {
  csvReader: {
    display: 'flex',
    flexDirection: 'row',
    marginBottom: 10,
  } as CSSProperties,
  browseFile: {
    width: '20%',
  } as CSSProperties,
  acceptedFile: {
    border: '1px solid #ccc', 
    height: 45,
    lineHeight: 2.5,
    paddingLeft: 10,
    width: '80%',
  } as CSSProperties,
  remove: {
    borderRadius: 0,
    padding: '0 20px',
  } as CSSProperties,
  progressBarBackgroundColor: {
    backgroundColor: 'grey',
  } as CSSProperties,
};

 export default function  MyChart() {
  
  const { CSVReader } = useCSVReader();

  const time_fmt_human = d3.timeFormat('%Y-%m-%d %H:%M')
  const time_fmt_iso_day = d3.timeFormat('%Y-%m-%d')

  const [errorMessage, setErrorMessage] = useState('');

  const initial_data:     CleanedRawData[] = [{
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
}]
  const initial_agg_data: AggData[] = [
    {
      date: 0,
      human_day: "2024-01-01",
      // raw_day: string; 
      in_sum: 0, 
      out_sum: 0
      }

  ]

  const [data, setRawData] = useState(initial_data)
  const [data_agg, setAggData] = useState(initial_agg_data)

  return (
    <>
    <CSVReader
// eslint-disable-next-line
      onUploadAccepted={(results: any) => {

        import_raw_csv(results, "in", setRawData, setAggData, setErrorMessage)
        
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
           
            <button type='button' {...getRootProps()} style={styles.browseFile}>
            Input energy - Browse file
            </button>
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
        import_raw_csv(results, "out", setRawData, setAggData, setErrorMessage)
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
            <button type='button' {...getRootProps()} style={styles.browseFile}>
              Output energy - Browse file
            </button>
            <div style={styles.acceptedFile}>
              {acceptedFile && acceptedFile.name}
            </div>
          </div>
          <ProgressBar style={styles.progressBarBackgroundColor} />
        </>
      )}
    </CSVReader>
    
    {errorMessage && (
      <p className="error"> {errorMessage} </p>
    )}

    <ResponsiveContainer minWidth={350} height={450}>
    <LineChart id="line1" data={data}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis xAxisId="0" dataKey="date" interval="preserveStart" allowDuplicatedCategory={false} tickFormatter={t => fmt_human_day(new Date(t)) }/>
      <YAxis />
      <Tooltip labelFormatter={t => time_fmt_human(new Date(t)) } />
      <Legend />
      <Line name="raw in"  type="linear" isAnimationActive={false} dataKey="in"  connectNulls stroke="#BB0000" dot={false} activeDot={{ r: 6 }} />
      <Line name="raw out" type="linear" isAnimationActive={false} dataKey="out" connectNulls stroke="#00AA00" dot={false} activeDot={{ r: 6 }} />
    </LineChart>
    </ResponsiveContainer>
    <ResponsiveContainer minWidth={350} height={450}>
    <LineChart id="line2" data={data_agg}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis xAxisId="0" dataKey="human_day" allowDuplicatedCategory={false} />
      <YAxis />
      <Tooltip labelFormatter={t => time_fmt_iso_day(new Date(t)) } />
      <Legend />
      <Line name="daily in"  dataKey="in_sum"  isAnimationActive={false} stroke="#BB0000" fill="#BB0000" />
      <Line name="daily out" dataKey="out_sum" isAnimationActive={false} stroke="#00AA00" fill="#00AA00" />
    </LineChart>
    </ResponsiveContainer>
    </>
   )

 }