import React, { useState } from "react";
import { Button, Card, Col, Row, Select, TimePicker, notification, message } from 'antd';
import Chart from "chart.js"
import { Tabs } from 'antd';

import { DatePicker, Space } from 'antd';
import { Input } from 'antd';
import { Option } from "antd/lib/mentions";
import moment from 'moment';
import {API_URL} from "./constants"



const { TextArea } = Input;
const { RangePicker } = DatePicker;
const { TabPane } = Tabs;


const CampaignSchedulerPane = () => {
    const [type, setType] = useState('daily');
    const [timing, setTiming] = useState()
    const [monthlyValues, setMonthlyValues] = useState([])
    const [weeklyValues, setWeeklyValues] = useState([])
    const [startDate, setStartDate] = useState()
    const [endDate, setEndDate] = useState()
    const [showLoading, setShowLoading] = useState(false)

    const openNotification = (type, content, title) => {

        switch (type) {
            case "Joke":
                notification.open({
                    message: "Here's a joke for you!",
                    description:
                        <p>{content}</p>
                });
                break;
            case "Meme":
                notification.open({
                    message: title,
                    description:
                        <img src={content} />
                });
        }
    };

    const onChangeTiming = (time, timeString) => {
        console.log(time, timeString)
        setTiming(time)
    }

    const daysOfTheMonth = []
    const daysOfTheWeek = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"]
    for(let i = 1 ; i <= 31 ; i++){
        if(i > 29)
            daysOfTheMonth.push(<Option key={i}>{i+" (if available)"}</Option>);
        else
            daysOfTheMonth.push(<Option key={i}>{i}</Option>);
    }
    for(let i = 0 ; i<= 7 ; i++){
        daysOfTheWeek.push(<Option key={daysOfTheWeek[i]}>{daysOfTheWeek[i]}</Option>)
    }
    React.useEffect(() => {
        
    },[])

    const handlePerMonthDaysChange = (values) => {
        setMonthlyValues(values)
    }

    const handlePerWeekDaysChange = (values) => {
        setWeeklyValues(values)
    }

    const onStartDateChange = (date, dateString) => {

        setStartDate(date)
    }
    const onEndDateChange = (date, dateString) => {
        setEndDate(date)
    }
    const onOk = value => {
        console.log(value)
    }


    const createUsableDates = () => {
        let start = startDate;
        let end = endDate;
        let time = moment(timing);

        let curr = moment(start).set({h: time.format('HH') , m: time.format('mm')});

        const usableSchedule = []
        if(type === "weekly")
            while(curr <= end){
                if(weeklyValues.includes(curr.format('dddd'))){
                    console.log(curr)
                    usableSchedule.push(moment(curr))
                }
                console.log(curr)
                curr.add(1,'day');
            }
        else if(type==="monthly"){
            while(curr <= end){
                if(monthlyValues.includes(curr.date().toString())){
                    console.log(curr);
                    usableSchedule.push(moment(curr))
                }
                curr.add(1,"day")
                console.log(curr.date())
            }
        }else{
            while( curr <= end){
                usableSchedule.push(moment(curr))
                curr.add(1,"days")
            }
        }
        

        console.log(usableSchedule)
        const hide = message.loading('Action in progress..', 0);
        // Dismiss manually and asynchronously
        //setTimeout(hide, 2500);

        fetch(`${API_URL}/schedule`, {
            method:"POST",
            mode:"cors",
            credentials:"include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                dates : usableSchedule,
                type,
                campaignName,
                tweet: campaignTweet
            })
            
        })
        .then(res => res.json())
        .then(response => {
            hide()
            message.success("Submitted new campaign!")

  
            // fetch(`${API_URL}/emotion?text=${campaignTweet}`)
            // .then(res => res.json())
            // .then(response => {
            //     if(response.status == 0){
                    const choice = Math.random();
                    if (choice > 0.5) {
                        fetch("https://meme-api.herokuapp.com/gimme")
                            .then(
                                res => res.json()
                            )
                            .then(response => {
                                console.log(response);
                                openNotification(
                                    "Meme",
                                    response.preview[response.preview.length - 1],
                                    response.title
                                )
                            })
                            .catch(err => {
                                console.error(err);
                            });
                    } else {
                        fetch("https://joke3.p.rapidapi.com/v1/joke", {
                            "method": "GET",
                            "headers": {
                                "x-rapidapi-key": "4dc1b17100msh3343e40346c63adp16db10jsna19f12669454",
                                "x-rapidapi-host": "joke3.p.rapidapi.com"
                            }
                        })
                            .then(
                                res => res.json()
                            )
                            .then(response => {
                                console.log(response.content);
                                openNotification(
                                    "Joke",
                                    response.content
                                )
                            })
                            .catch(err => {
                                console.error(err);
                            });
                    }
                
            }
        )
            
    }

    const [campaignName, setCampaignName] = useState();
    const [ campaignTweet, setCampaignTweet] = useState();


    const setName = (e) => {
        setCampaignName(e.target.value)
        console.log(e.target.value)
    }
    const setTweet = e =>{ setCampaignTweet(e.target.value); console.log(e.target.value)}
    return (

        <div>

            <Row justify="space-around">
                <div style={{textAlign:"left"}}>
                    Name your capaign:
                </div>
                <Col span={24}>
                    <Input onChange={setName}/>
                </Col>
                <br/>
                <br/>
                <div>
                    Write your tweets here!
                </div>
                <Col span={24}>
                    <TextArea rows={4} showCount maxLength={100} onChange={setTweet}/>
                </Col>
            </Row>
            <Row>
                <Col span={7}>
                    <div>Choose a recurrence format: </div>
                    <Select value={type} onChange={setType} size="large">
                        <Select.Option value="daily">Daily - Post everyday</Select.Option>
                        <Select.Option value="weekly">Weekly - Post on certain days</Select.Option>
                        <Select.Option value="monthly">Monthly - Post on certain days</Select.Option>
                    </Select>
                </Col>
                <Col span={5} flex>
                    <div>Choose a time: </div>
                    <TimePicker onChange={onChangeTiming} format="HH:mm" defaultOpenValue={moment('00:00', 'HH:mm')} size="large" />,
                </Col>
                <Col span={5}>
                    <div>Choose a start date: </div>
                     <DatePicker size={"large"}  format="YYYY-MM-DD" onChange={onStartDateChange} onOk={onOk}/>
                </Col>
                <Col span={5}>
                    <div>Choose an end date: </div>
                     <DatePicker size={"large"}  format="YYYY-MM-DD" onChange={onEndDateChange} onOk={onOk}/>
                </Col>                
            </Row>

            <Row>
                <Col style={{marginTop:"40px"}} span={24}>
                    {
                        type === "monthly" && (
                            <Select
                                mode="multiple"
                                allowClear
                                style={{ width: '100%' }}
                                placeholder="Which days of the month do you want to schedule tweets on?"
                                defaultValue={[]}
                                onChange={handlePerMonthDaysChange}
                            >
                                {daysOfTheMonth}
                            </Select>
                        )
                    }
                     {
                        type === "weekly" && (
                            <Select
                                mode="multiple"
                                allowClear
                                style={{ width: '100%' }}
                                placeholder="Which days of the week do you want to schedule tweets on?"
                                defaultValue={[]}
                                onChange={handlePerWeekDaysChange}
                            >
                                {daysOfTheWeek}
                            </Select>
                        )
                    }
                </Col>
            </Row>


            <Button type="primary" style={{marginTop: "50px"}} block size="large" onClick={() => createUsableDates()}>
                Schedule
            </Button>
        </div>
    )
}

export default CampaignSchedulerPane