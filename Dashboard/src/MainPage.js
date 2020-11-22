import React, { useEffect, useState } from "react";
import { Alert, Card, Col, notification, Row } from 'antd';
//import Chart from "chart.js"
import { Tabs } from 'antd';
import { Chart } from "react-charts";

import { DatePicker, Space } from 'antd';
import { Input } from 'antd';
import CampaignSchedulerPane from "./CampaignSchedulerPane";

import { Spin } from 'antd';
import { DeleteTwoTone, LoadingOutlined, StopTwoTone } from '@ant-design/icons';
import { List, Avatar } from 'antd';
import s from "./MainPage.module.css"
import ResizableBox from "./ResizeableBox";
import HeatMap from "react-heatmap-grid";
import { API_URL } from "./constants"
import { mockData } from "./engagementmock";

const antIcon = <LoadingOutlined style={{ fontSize: 48 }} spin />;
const { TextArea } = Input;


const { TabPane } = Tabs;
const Main = () => {

    const [campaigns, setCampaigns] = useState([]);
    const [pastCampaigns, setPastCampaigns] = useState([])
    const [followersData, setFollowersData] = useState();
    const [selfData, setSelfData] = useState({ weekly: [], monthly: [] });
    const [bestTimeData, setBestTimeData] = useState({});

    function callback(key) {
        console.log(key);
    }


    const week = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
    /**
     * Line Chart Data--------------------------------------
     */
    const selfTrendsWeeklyData = React.useMemo(
        () => {
            if (!selfData || !selfData.weekly)
                return []
            const weeklyData = selfData.weekly.map((weekly, index) => {
                return {
                    primary: index + 1,
                    secondary: weekly + Math.floor(Math.random() * 100)
                }
            });

            console.log(
                {
                    label: 'Weekly engagement trends',
                    data: weeklyData,
                }
            )
            return [
                {
                    label: 'Weekly engagement trends',
                    data: weeklyData,
                },
            ]
        }, [selfData])

    const followersTrendsWeeklyData = React.useMemo(
        () => {
            if (!followersData || !followersData.weekly)
                return []
            const weeklyData = followersData.weekly.map((weekly, index) => {
                return {
                    primary: index + 1,
                    secondary: weekly + Math.floor(Math.random() * 125)
                }
            });

            console.log(
                {
                    label: 'Weekly engagement trends',
                    data: weeklyData,
                }
            )
            return [
                {
                    label: 'Weekly engagement trends',
                    data: weeklyData,
                },
            ]
        }, [followersData])

    const selfTrendHourlydata = React.useMemo(() => {
        console.log("Setting self hourly")
        if (!selfData || !selfData.hourly)
            return []
        const hourlyData = selfData.hourly.map((hourly, index) => {
            return {
                primary: index,
                secondary: hourly + Math.floor(Math.random() * 100)//4*Math.floor(Math.random()*20)//Math.floor(Math.random() * 25) //+hour 
            }
        });

        console.log(
            {
                label: 'Self Hourly engagement trends',
                data: hourlyData,
            }
        )
        return [
            {
                label: 'Hourly engagement trends',
                data: hourlyData,
            },
        ]
    }, [selfData])


    const followersTrendHourlydata = React.useMemo(() => {
        console.log("Setting followers hourly data")
        if (!followersData || !followersData.hourly)
            return []
        const hourlyData = followersData.hourly.map((hour, index) => {
            return {
                primary: index,
                secondary: Math.floor(Math.random() * 25)  //+hour
            }
        });
        return [
            {
                label: 'Hourly engagement trends',
                data: hourlyData,
            },
        ]
    }, [followersData]);



    const axes = React.useMemo(
        () => [
            { primary: true, type: 'linear', position: 'bottom' },
            { type: 'linear', position: 'left' },
        ],
        []
    )
    const series = React.useMemo(
        () => ({
            showPoints: false,
        }),
        []
    );

    /**
     * Heatmap Data ---------------------------
     */



    const heatMapXLabels = new Array(59).fill(0).map((_, i) => `${i}`);

    const heatMapXLabelsVisibility = new Array(59)
        .fill(0)
        .map((_, i) => (i % 2 === 0 ? true : false));

    const heatMapYLabels = new Array(24).fill(0).map((_, i) => i + ":00");
    // const heatmapData = new Array(heatMapYLabels.length)
    //     .fill(0)
    //     .map(() =>
    //         new Array(heatMapXLabels.length).fill(0).map(() => Math.floor(Math.random() * 100))
    //     );


    const [heatmapData, setHeatMapData] = useState([])
    //fetch trends data

    React.useEffect(() => {

        fetch(`${API_URL}/trends`, {
            mode: "cors",
            credentials: "include"
        })
            .then(res => res.json())
            .then(response => {
                console.log("RECEIVED DATA : ")
                console.log(response)
                const data = response;

                setBestTimeData({
                    bestDay: data.Best_day,
                    bestTime: data.Best_time
                });

                let hourly = [];
                let sum = 0;
                let count = 0;
                console.log(data.Engagement_self_hourly);
                for (let i = 0; i < data.Engagement_self_hourly.length; i++) {
                    sum += data.Engagement_self_hourly[i];
                    if (count == 59) {
                        hourly.push(sum);
                        sum = 0;
                        count = 0;
                    }
                    ++count;
                }
                console.log(hourly)
                setSelfData({
                    hourly: [...hourly],
                    weekly: data.Engagement_self_daily,
                    monthly: data.Engagement_self_lastmonth
                })

                setBestTimeData({
                    dates: data.Best_day,
                    times: data.Best_time
                })
                sum = 0;
                hourly = []
                count = 0;
                for (let i = 0; i < data.Engagement_followers_hourly.length; i++) {
                    sum += data.Engagement_followers_hourly[i];
                    if (count == 59) {
                        hourly.push(sum);
                        sum = 0;
                        count = 0;
                    }
                    ++count;
                }

                setFollowersData({
                    hourly: [...hourly],
                    weekly: data.Engagement_followers_daily,
                    monthly: data.Engagement_followers_lastmonth
                })


                const hmData = [];
                let temp = []
                count = 0;
                for (let i = 0; i < data.TimeLine_total.length; i++) {
                    temp.push(data.TimeLine_total[i]);
                    if (count == 59) {
                        hmData.push([...temp])
                        temp = [];
                        count = 0;
                    }
                    ++count;
                }
                console.log(hmData)
                console.log(hourly)
                setHeatMapData(hmData);
            })
    }, [])

    //Fetch campagin data
    React.useEffect(() => {
        fetch(`${API_URL}/campaigns`, {
            mode: "cors",
            credentials: "include"
        })
            .then(
                res => res.json()
            )
            .then(
                response => {
                    console.log("CAMPAINGS :::: ", response);
                    const current = [];
                    const past = [];
                    response.map(
                        item => {
                            if (item.active)
                                current.push(item)
                            else
                                past.push(item)
                        }
                    )
                    setCampaigns(current);
                    setPastCampaigns(past);
                }
            )

    }, []);

    //Fetch jokes/memes if necessary

    const onChange = (value, dateString) => {
        console.log('Selected Time: ', value);
        console.log('Formatted Selected Time: ', dateString);
    }

    const onOk = (value) => {
        console.log('onOk: ', value);
    }

    const capitalizeFirstLetter = (string) => {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }

    const deleteCampaign = id => {
        fetch(`${API_URL}/campaigns?id=${id}`, {
            method: "DELETE",
            mode: "cors",
            credentials: "include"
        })
            .then(res => res.json())
            .then(response => console.log(response))
    }
    return (
        <div className={`${s.wrapper} wrapper`}>
            <div className={s.title}>
                Tweedle!
            </div>
            <div>
                <Row justify="space-around">
                    <Col span={12}>
                        <Card hoverable={true} className={s.card}>
                            <div className="cardHeader" style={{ textAlign: "center", margin: "50px" }}>
                                <h2>Schedule Tweets</h2>
                                <h4 style={{ color: "gray" }}>Use the interface below to carefully schedule your tweets</h4>
                                {
                                    bestTimeData && bestTimeData.dates? (
                                        <Alert message={
                                        <div>
                                            Best days for you to schedule a post on are: &nbsp;
                                            {
                                                bestTimeData.dates.map(date => {
                                                    return <span style={{marginRight:"5px"}}>{date} , </span>
                                                })
                                            }
                                        </div>} type="success" showIcon />
                                    ):
                                    <Spin indicator={antIcon}/>
                                }
                                <br/>
                                {
                                    bestTimeData && bestTimeData.times? (
                                        <Alert message={
                                        <div>
                                            Best times for you to schedule a post on are: &nbsp;
                                            {
                                                bestTimeData.times.map(time => {
                                                    return <span style={{marginRight:"5px"}}>{time} , </span>
                                                })
                                            }
                                        </div>} type="success" showIcon />
                                    ):
                                    <></>
                                }
                                
                            </div>
                            <Tabs defaultActiveKey="2" onChange={(key) => console.log(key)}>
                                <TabPane tab="Single Tweet" key="1">
                                    <div >
                                        <Row justify="space-around">
                                            <Col span={12}>
                                                <TextArea showCount maxLength={100} />
                                            </Col>
                                            <Col span={6}>
                                                <Space direction="vertical" size={24}>
                                                    <DatePicker size={"large"} showTime={{ format: 'HH:mm' }} format="YYYY-MM-DD HH:mm" onChange={onChange} onOk={onOk} />
                                                </Space>
                                            </Col>
                                        </Row>
                                    </div>
                                </TabPane>

                                <TabPane tab="Campaign" key="2">
                                    <CampaignSchedulerPane />
                                </TabPane>
                            </Tabs>

                        </Card>
                    </Col>
                    <Col span={8}>
                        <Card hoverable={true} className={s.card}>
                            <div className="cardHeader" style={{ textAlign: "center", margin: "50px" }}>
                                <h2>Trends</h2>
                                <h5 style={{ color: "gray" }}>Analyze how your tweets have been performing over time</h5>
                            </div>
                            <Tabs defaultActiveKey="1" onChange={callback}>
                                <TabPane tab="Hourly" key="1">
                                    <div style={{textAlign:"center", display:"flex", justifyContent:"center", alignItems:'center'}}>
                                        <ResizableBox>{
                                                selfTrendHourlydata && selfTrendHourlydata.length?
                                                (
                                                    <Chart data={selfTrendHourlydata} series={series} axes={axes} tooltip />
                                                ):(
                                                    <Spin indicator={antIcon} />
                                                )
                                            }
                                            
                                        </ResizableBox>
                                    </div>
                                </TabPane>
                                <TabPane tab="Weekly" key="2">
                                    <ResizableBox>
                                        {
                                            selfTrendsWeeklyData && selfTrendsWeeklyData.length?
                                            (       
                                                <Chart data={selfTrendsWeeklyData} series={series} axes={axes} tooltip />
                                            )
                                            :
                                            (
                                                <Spin indicator={antIcon} />

                                            )
                                        }
                                    </ResizableBox>
                                </TabPane>
                            </Tabs>
                        </Card>
                    </Col>
                </Row>
            </div>

            <div style={{ marginTop: "100px" }}>
                <Row justify="space-around">
                    <Col span={12}>
                        <Card hoverable={true} className={s.card}>
                            <div style={{ textAlign: "center", margin: "50px" }}>
                                <h2>Campaigns</h2>
                                <h5 style={{ color: "gray" }}>View and manage your existing campaigns</h5>
                            </div>
                            <Tabs defaultActiveKey="1" onChange={callback} centered>
                                <TabPane tab="Current Campaigns" key="1">
                                    <div>
                                        {
                                            campaigns && campaigns.length ? (
                                                <div style={{ textAlign: "left" }}>
                                                    <List
                                                        itemLayout="horizontal"
                                                        dataSource={campaigns}
                                                        renderItem={item => (
                                                            <List.Item>
                                                                <List.Item.Meta
                                                                    avatar={<Avatar src="https://assets.stickpng.com/images/580b57fcd9996e24bc43c53e.png" />}
                                                                    title={`${capitalizeFirstLetter(item.type)} Campaign : ${item.campaignName || "New Campaign"} `}
                                                                    description={<div>
                                                                        {`Total dates scheduled : ${item.dates.length}`}
                                                                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                                                                            <div>
                                                                                Starts at : {item.startsAt}
                                                                            </div>
                                                                            <div>
                                                                                Ends at : {item.endsAt}
                                                                            </div>
                                                                            <div>
                                                                                <DeleteTwoTone twoToneColor="red" onClick={() => deleteCampaign(item._id)} />
                                                                            </div>
                                                                        </div>
                                                                        <div>
                                                                            <span style={{ fontWeight: "bold", fontSize: "14px" }}>Tweet Content : </span>{item.tweet}
                                                                        </div>
                                                                    </div>}
                                                                />
                                                            </List.Item>
                                                        )}
                                                    />
                                                </div>
                                            )
                                                :
                                                <Spin indicator={antIcon} />
                                        }
                                    </div>
                                </TabPane>
                                <TabPane tab="Past Campaigns" key="2">
                                    {
                                        pastCampaigns && pastCampaigns.length ? (
                                            <div>
                                                <List
                                                    itemLayout="horizontal"
                                                    dataSource={campaigns}
                                                    renderItem={item => (
                                                        <List.Item>
                                                            <List.Item.Meta
                                                                avatar={<Avatar src="https://assets.stickpng.com/images/580b57fcd9996e24bc43c53e.png" />}
                                                                title={`${capitalizeFirstLetter(item.type)} Campaign`}
                                                                description={<div>
                                                                    {`Total dates scheduled : ${item.dates.length}`}
                                                                    <div>
                                                                        <div>
                                                                            Starts at : {item.startsAt}
                                                                        </div>
                                                                        <div>
                                                                            Ends at : {item.endsAt}
                                                                        </div>
                                                                    </div>
                                                                    <div>
                                                                        {item.tweet}
                                                                    </div>
                                                                </div>}
                                                            />
                                                        </List.Item>
                                                    )}
                                                />
                                            </div>
                                        )
                                            :
                                            <div style={{ textAlign: "center" }}>
                                                <Spin indicator={antIcon} />
                                            </div>
                                    }
                                </TabPane>
                            </Tabs>



                        </Card>
                    </Col>
                    <Col span={10}>
                        <Card hoverable={true} className={s.card}>
                            <div className="cardHeader" style={{ textAlign: "center", margin: "50px" }}>
                                <h2>Follower Activity Trends</h2>
                                <h5 style={{ color: "gray" }}>Knowing when to post is super important! Understand when your followers are the most active</h5>
                            </div>
                            <Tabs defaultActiveKey="1" onChange={callback}>
                                <TabPane tab="Daily Activity Map" key="1">
                                    <div style={{ textAlign: "center", display: "flex", alignItems: "center" }}>
                                        {/* <ResizableBox height={260}> */}
                                        {
                                            heatmapData && heatmapData.length &&
                                            <HeatMap
                                                xLabels={heatMapXLabels}
                                                yLabels={heatMapYLabels}
                                                xLabelsLocation={"bottom"}
                                                xLabelsVisibility={heatMapXLabelsVisibility}
                                                xLabelWidth={10}
                                                data={heatmapData}
                                                squares
                                                height={10}
                                                onClick={(x, y) => alert(`Clicked ${x}, ${y}`)}
                                                cellStyle={(background, value, min, max, data, x, y) => ({
                                                    background: `rgb(255, 0, 230, ${1 - (max - (value + Math.floor(Math.random() * 10))) / (max - (min + Math.floor(Math.random() * 10)))})`,
                                                    fontSize: "0px",
                                                    color: "#444"
                                                })}
                                                cellRender={value => value && <div>{value}</div>}
                                            />
                                        }
                                        {/* </ResizableBox> */}

                                    </div>
                                </TabPane>
                                <TabPane tab="Hourly" key="2">
                                    <div>
                                        <ResizableBox>{
                                                followersTrendHourlydata && followersTrendHourlydata.length?(             
                                                    <Chart data={followersTrendHourlydata} series={series} axes={axes} tooltip />
                                                ):(
                                                    <Spin indicator={antIcon}/>
                                                )
                                            }
                                        </ResizableBox>
                                    </div>
                                </TabPane>
                                <TabPane tab="Weekly" key="3">
                                    <ResizableBox>
                                        {
                                            followersTrendsWeeklyData && followersTrendsWeeklyData.length?(             
                                                <Chart data={followersTrendsWeeklyData} series={series} axes={axes} tooltip />
                                            ):(
                                                <Spin indicator={antIcon}/>
                                            )
                                        }
                                    </ResizableBox>
                                </TabPane>
                            </Tabs>
                        </Card>
                    </Col>

                </Row>
            </div>
        </div>
    )
}

export default Main;