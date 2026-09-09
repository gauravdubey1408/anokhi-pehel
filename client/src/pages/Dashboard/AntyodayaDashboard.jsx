import DashboardLayout from "../../components/Dashboard/DashboardLayout";
import Button from "../../components/Dashboard/Button";
import { BASE_URL } from "../../Service/helper";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import AttendanceDiv from "../../components/Dashboard/AttendanceDiv";
import Attendance from "../../components/Dashboard/Attendance";
const Dashboard = () => {
  const currentColor = "#03C9D7";
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.user);
  const [mentor, setMentor] = useState(null);
  const addEvent = () => {
    navigate("/addEvent");
  };
  const checkEvents = () => {
    navigate("/checkEvents");
  };
  const addParticipants = () => {
    navigate("/addParticipant");
  };
  const findParticipants = () => {
    navigate("/viewParticipants");
  };

  const addPoc = () => {
    navigate("/addPoc");
  };
  const viewPoc = () => {
    navigate("/viewPoc");
  };
  const winners = () => {
    navigate("/viewWinners");
  };
  
  
  return (
    <DashboardLayout>
      <div className="m-2 md:m-10 mt-24 p-2 md:p-10 bg-white rounded-3xl">
        {user ? (
          <h1 className="font-bold text-center">
          Welcome On Antyodaya Dashboard, {user.name}!
        </h1>
        
        ) : (
          <p>No mentor data available.</p>
        )}
      </div>

      <div className="columns-3xs ...  flex flex-col sm:flex-row gap-16 p-10 ">
      <div className="flex-1 sm:w-1/2 lg:w-1/4 bg-blue-200 rounded-lg p-4 mt-4 sm:mt-0">
          <div className="flex justify-center">
            <div className="rounded-lg p-4">
              <Button
                color="black"
                bgColor={currentColor}
                text="Add Participants"
                borderRadius="8px"
                width="5px"
                height="10px"
                custumFunc={addParticipants}
              />
            </div>
            <div className="rounded-lg p-4">
              <Button
                color="black"
                bgColor={currentColor}
                text="View Participants"
                borderRadius="8px"
                width="5px"
                height="10px"
                custumFunc={findParticipants}
              />
            </div>
          </div>
        </div>
        <div className="flex-1 sm:w-1/2 lg:w-1/4 bg-blue-200 rounded-lg p-4 mt-4 sm:mt-0">
          <div className="flex justify-center">
          {user?.isAdmin === true && (
  <div className="rounded-lg p-4">
    <Button
      color="black"
      bgColor={currentColor}
      text="Add Event"
      borderRadius="8px"
      width="5px"
      height="10px"
      custumFunc={addEvent}
    />
  </div>
)}

            <div className="rounded-lg p-4">
              <Button
                color="black"
                bgColor={currentColor}
                text="Check Events"
                borderRadius="8px"
                width="5px"
                height="10px"
                custumFunc={checkEvents}
              />
            </div>
          </div>
        </div>
       
      </div>
      
     

      <div className="columns-3xs ...  flex flex-col sm:flex-row gap-16 p-10 ">
      <div className="flex-1 sm:w-1/2 lg:w-1/4 bg-blue-200 rounded-lg p-4 mt-4 sm:mt-0">
          <div className="flex justify-center">
            <div className="rounded-lg p-4">
              <Button
                color="black"
                bgColor={currentColor}
                text="Add Poc for Schools"
                borderRadius="8px"
                width="5px"
                height="10px"
                custumFunc={addPoc}
              />
            </div>
            <div className="rounded-lg p-4">
              <Button
                color="black"
                bgColor={currentColor}
                text="View Poc for Schools"
                borderRadius="8px"
                width="5px"
                height="10px"
                custumFunc={viewPoc}
              />
            </div>
          </div>
        </div>
        <div className="flex-1 sm:w-1/2 lg:w-1/4 bg-blue-200 rounded-lg p-4 mt-4 sm:mt-0">
          <div className="flex justify-center">
            <div className="rounded-lg p-4">
              <Button
                color="black"
                bgColor={currentColor}
                text="Winner List of all Event"
                borderRadius="8px"
                width="5px"
                height="10px"
                custumFunc={winners}
              />
            </div>
            
          </div>
        </div>
      </div>
      

      
    </DashboardLayout>
  );
};

export default Dashboard;
