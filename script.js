function currentTime() {
    const currentTime = new Date().toLocaleString('en-US', { hour: 'numeric', minute: "numeric", second: "numeric", hour12: true })
    let splitedTime = String(currentTime).split(":")
    splitedTime[0] = splitedTime[0].padStart(2, "0")
    const timeString = `${splitedTime[0]} : ${splitedTime[1]} : ${splitedTime[2]}`
    return timeString
}

function displayCurrentTime() {
    const currTime = currentTime()
    document.getElementById("current-time").innerText = currTime
}

function displayAlarmInput() {
    for (let hr = 1; hr <= 12; hr++) {
        const optionELement = document.createElement("option")
        optionELement.innerText = `${hr.toString().padStart(2, "0")}`
        inputHourElement.appendChild(optionELement)
    }

    for (let m = 0; m < 60; m++) {
        const optionELement1 = document.createElement("option")
        optionELement1.innerText = `${m.toString().padStart(2, "0")}`
        inputMinuteElement.appendChild(optionELement1)

        const optionELement2 = document.createElement("option")
        optionELement2.innerText = `${m.toString().padStart(2, "0")}`
        inputSecondElement.appendChild(optionELement2)
    }

    const listAMPM = ["AM", "PM"]
    for (let i of listAMPM) {
        const optionELement = document.createElement("option")
        optionELement.innerText = i
        inputAMPMElement.appendChild(optionELement)
    }
}

function convertToSeconds(time) {
    // convert to 24 hr format
    let hour = parseInt(time.slice(0, 2))
    let ampm = time.slice(13, 15)
    if (ampm == 'AM' && hour === 12) hour = 0
    else if (ampm == 'PM' && hour < 12) hour += 12

    // convert to seconds
    return (hour * 3600 + parseInt(time.slice(5, 7)) * 60 + parseInt(time.slice(10, 12)))
}

function timeLeftForAlarm(alarm) {
    const currConvertedTime = convertToSeconds(currentTime())
    let alarmConvertedTime = convertToSeconds(alarm)

    //checking the condition whether the alarm set passed the current time, then the alarm is shifted to next day
    if ((alarmConvertedTime - currConvertedTime) <= 0) {
        alarmConvertedTime += 24 * 3600
    }

    //converting time left in seconds back to hours, minutes, seconds
    const timeLeft = alarmConvertedTime - currConvertedTime
    const hoursleft = Math.floor(timeLeft / 3600)
    const minutesLeft = Math.floor((timeLeft % 3600) / 60)
    const secondsLeft = Math.floor((timeLeft % 3600) % 60)

    return { hoursleft, minutesLeft, secondsLeft }
}

function displayAlarmTimeLeft(alarm) {
    const timeLeft = timeLeftForAlarm(alarm)
    timeleftdivElement.innerText = `${timeLeft.hoursleft} hours ${timeLeft.minutesLeft} minutes ${timeLeft.secondsLeft} seconds from now    `
    timeleftdivElement.style.display = "block"
    setTimeout(() => {
        timeleftdivElement.style.display = "none"
    }, 2000)
}


const setAlarmButtonElement = document.getElementById("set-alarm-btn")
const inputHourElement = document.getElementById("input-hour")
const inputMinuteElement = document.getElementById("input-minute")
const inputSecondElement = document.getElementById("input-second")
const inputAMPMElement = document.getElementById("input-am-pm")
const upcommingAlarmContainer = document.getElementById("upcomming-alarms-container")
const timeleftdivElement = document.getElementById("alarm-time-left")
let alarm_list = []

setAlarmButtonElement.addEventListener("click", () => {
    const AlarmElement = document.createElement("div")
    const newAlarm = `${inputHourElement.value} : ${inputMinuteElement.value} : ${inputSecondElement.value} ${inputAMPMElement.value}`

    if (!alarm_list.includes(newAlarm)) {
        AlarmElement.innerText = newAlarm
        AlarmElement.id = newAlarm
        AlarmElement.classList.add("new-alarm")
        alarm_list.push(newAlarm)

        displayAlarmTimeLeft(newAlarm)

        const deleteButton = document.createElement("button")
        deleteButton.classList.add("btn", "btn-secondary")
        deleteButton.innerText = "Delete"
        AlarmElement.appendChild(deleteButton)
        upcommingAlarmContainer.appendChild(AlarmElement)

        deleteButton.addEventListener("click", () => {
            upcommingAlarmContainer.removeChild(AlarmElement)
            alarm_list.pop(newAlarm)

        })
    }
    else {
        alert("Alarm Already Set")
    }
})

setInterval(() => {

    displayCurrentTime()
    const currentTimeString = currentTime()

    if (alarm_list.includes(currentTimeString)) {
        alert("!!!!! Alarm !!!!!")

        if (confirm("Click Okay to Delete the Alarm")) {
            alarm_list.pop(currentTimeString)
            const AlarmElement = document.getElementById(currentTimeString)
            upcommingAlarmContainer.removeChild(AlarmElement)
        }
    }
}, 1000)

displayCurrentTime()
displayAlarmInput()
