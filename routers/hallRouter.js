import express from "express";
const hallRouter = express.Router();
import {halls, bookings, customers} from '../data.js'

const checkNonEmpty = (objToBeValidated) => {
    var isValid;
    for(let key in objToBeValidated){
        isValid = typeof(objToBeValidated[key]) === 'number' ?    
            (objToBeValidated[key] >0 ? true: false) : typeof(objToBeValidated[key]) === 'string' ?
                (objToBeValidated[key].length > 0 ? true: false) : typeof(objToBeValidated[key]) === 'object'?
                    (objToBeValidated[key].length > 0 ? true: false) : undefined
        if(!isValid){
            return {isValid: false, key: key, value: objToBeValidated[key], msg:`${key} is with ${objToBeValidated[key]}(empty) value - Invalid. Please enter proper value`};
        }
    }
    return {isValid: true, obj: objToBeValidated, msg:`Valid Object`};
}

const checkDate = (bookingDate) => {
    let date = new Date(bookingDate)
    if(date instanceof Date && !isNaN(date)){
      return {isValid: true, date: date, msg:`Valid Object`};
    }else{
      return {isValid: false, msg:`Date is with ${date} value - Invalid. Please enter 'YYYY-MM-DD' date format`};
        
    }
}

const checkTime = (bookingTime, bookingDate) => {
    let startTime, endTime, flag = true;
      bookingTime.map((data) => data.split(':')).forEach((data, index) =>{
        if(flag == true){
        if(+data[0] <=24 && +data[1]<60){
          if(index === 0){
            startTime =  new Date(bookingDate.setHours(+data[0],+data[1])).toString();
          }else{
            endTime = new Date(bookingDate.setHours(+data[0],+data[1])).toString()
          }
        }else{
          flag = false
        }}
      })
      if(flag){
        return {isValid: true, msg:"Valid", startTime:startTime ,endTime:endTime }
      }else{
        return {isValid: false, msg:"Invalid Time! Please set the time in (HH:MM) 24 Hours format"}
      }
      
  }


const checkAvailability = (bookingObj) => {
  let startTime = new Date(bookingObj.startTime);
  let endTime = new Date(bookingObj.endTime);
  let bookingsOfRoomId = bookings.filter((booking) => booking.roomId === bookingObj.roomId)
  
  if(bookingsOfRoomId.length >0){
    let clashedScheduleList  = bookingsOfRoomId.filter((booking) =>  (startTime >= new Date(booking.startTime) && startTime<new Date(booking.endTime)) || (endTime >= new Date(booking.startTime) && endTime<=new Date(booking.endTime)) || (startTime <= new Date(booking.startTime) && endTime>=new Date(booking.endTime)));
    if(clashedScheduleList.length > 0){
      return {isAvailable: false, msg:"Rooms booked for these date & time, Please Select other slots", list: clashedScheduleList}
    } 
  }
    return {isAvailable: true, msg:"Booking..", list: bookingObj}

}

hallRouter.post("/new", async (req, res) => {
  const { body: hallObj } = req;
  let validityCheck = checkNonEmpty(hallObj);
  if(!validityCheck.isValid){
    res.status(400).send({msg: validityCheck.msg});
  }else{
    halls.push({
        ...hallObj,
        roomId: `${Date.now().toString()}_${hallObj.name}`,
        registered_at: new Date().toString(),
        bookings:[]
      });
      //console.log(halls, bookings);
      res.send({ msg: "Hall created Successfully" });
  }
  
});

hallRouter.get("/getAllRooms", async (req, res) => {
  //console.log(halls, bookings);
  res.send({ halls, msg: "Hall Details successfully retrieved" });

});

hallRouter.get("/getAllBookings", async (req, res) => {
      //console.log(halls, bookings);
      res.send({ bookings, msg: "Booking Details successfully retrieved" });
  
});

hallRouter.post("/newBooking", async (req, res) => {
    const { body:hallBookingObj } = req;
    let checkUser = customers.filter((data)=> data.userName === hallBookingObj.userName).length > 0 ? {isValid: true, msg:"Valid User"}: {isValid: false, msg:"User not found"} 
    let checkHall = halls.filter((data)=> data.roomId === hallBookingObj.roomId).length > 0 ? {isValid: true, msg:"Valid Hall"}: {isValid: false, msg:"Hall not found, Please enter the valid Room ID"} 
    let emptyCheck = checkNonEmpty(hallBookingObj);
    let dateCheck = checkDate(hallBookingObj.date);
    let timeCheck = checkTime([hallBookingObj.startTime, hallBookingObj.endTime], new Date(hallBookingObj.date));
    if(!checkHall.isValid || !checkUser.isValid || !emptyCheck.isValid || !dateCheck.isValid || !timeCheck.isValid){
      res.status(400).send({msg: !checkHall.isValid ? checkHall.msg : !checkUser.isValid ? checkUser.msg : !emptyCheck.isValid ? emptyCheck.msg : !dateCheck.isValid ? dateCheck.msg : !timeCheck.isValid? timeCheck.msg:''});
    }else{
        let formattedHallookingObj = {...hallBookingObj, date: dateCheck.date.toString(), startTime: timeCheck.startTime, endTime: timeCheck.endTime}
        //console.log(formattedHallookingObj);
        const {isAvailable, msg, list}=checkAvailability(formattedHallookingObj);
        if(isAvailable){
          bookings.push({
            ...formattedHallookingObj,
            bookingId: `${hallBookingObj.userName}_${Date.now().toString()}`,
            bookedAt: new Date().toString(),
            status: "Pending"
          });
          //console.log(halls, bookings);
          customers.filter((data) => data.userName === formattedHallookingObj.userName).map((data) => {data.bookings.push(formattedHallookingObj)})
          halls.filter((data) => data.roomId === formattedHallookingObj.roomId).map((data) => {data.bookings.push(formattedHallookingObj)})
          res.send({ msg: "Hall Booked Successfully" });
        }else{
          res.status(400).send({ msg: msg, clashingSchedule: list });
        }
        
    }
    
  });

export default hallRouter;
