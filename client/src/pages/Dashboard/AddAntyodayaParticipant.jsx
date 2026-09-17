import DashboardLayout from "../../components/Dashboard/DashboardLayout";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { classes, locations, modes } from "../../constants/Dashboard";
import { BASE_URL } from "../../../src/Service/helper";
import "react-datepicker/dist/react-datepicker.css";
import ErrorMessageModel from "../../components/Models/ErrorMessageModel";
import SuccessMessage from "../../components/Models/SuccessMessageModel";

const AddAntyodayaParticipant = () => {
  const [credentials, setCredentials] = useState({
    name: "",
    class: "",
    phone: "",
    school: "",
    // aadhar: "",
    address: "",
    photo: "",
    poc: "",
    events: [],
  });
  const [pocList, setPocList] = useState([]);
  const [eventList, setEventList] = useState([]);
  const [participantList, setParticipantList] = useState([]);
  const [imageSize, setImageSize] = useState("");
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const WIDTH = 800;

  useEffect(() => {
    // Fetch POC and Event data on component mount
    const fetchPocAndEventData = async () => {
      try {
        const pocResponse = await axios.get(`${BASE_URL}/pocList`);
        const eventResponse = await axios.get(`${BASE_URL}/getEvents`);
        const participantResponse = await axios.get(`${BASE_URL}/participantList`);
        const currentYear = new Date().getFullYear();

        // Filter POCs by current year
        const currentYearPocs = pocResponse.data.filter(poc => poc.year === currentYear);
        const currentYearEvents = eventResponse.data.filter(event => event.year === currentYear);
        setPocList(currentYearPocs);
        setEventList(currentYearEvents);
        setParticipantList(participantResponse.data || []);

        console.log("POCs (current year only):", currentYearPocs);
        console.log("Events (current year only):", currentYearEvents);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchPocAndEventData();
  }, []);

  // Resizing and setting photo
  const resizeImage = (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);

      reader.onload = (event) => {
        const imageUrl = event.target.result;
        const image = new Image();
        image.src = imageUrl;

        image.onload = () => {
          const canvas = document.createElement("canvas");
          const ratio = WIDTH / image.width;
          canvas.width = WIDTH;
          canvas.height = image.height * ratio;

          const context = canvas.getContext("2d");
          context.drawImage(image, 0, 0, canvas.width, canvas.height);

          // Convert the canvas to a file
          canvas.toBlob(
            (blob) => {
              const resizedFile = new File([blob], file.name, {
                type: "image/jpeg",
                lastModified: Date.now(),
              });
              resolve(resizedFile);
            },
            "image/jpeg",
            0.98
          );
        };
      };
    });
  };

  const isDanceEvent = (event) => {
    return Boolean(event?.eventName && event.eventName.toLowerCase().includes("dance"));
  };

  const getDanceParticipantsCount = (event) => {
    if (!credentials.poc && !credentials.school) return 0;
    const currentYear = new Date().getFullYear();
    return participantList.filter((p) => {
      if (!p) return false;
      const matchesYear = p.year === currentYear || !p.year;
      const matchesPoc = credentials.poc && (p.poc === credentials.poc || p.poc?._id === credentials.poc);
      const matchesSchool = credentials.school && typeof p.school === "string" && typeof credentials.school === "string" && p.school.trim().toLowerCase() === credentials.school.trim().toLowerCase();
      const matchesPocOrSchool = matchesPoc || matchesSchool;

      const hasEvent = p.events && Array.isArray(p.events) && (
        p.events.includes(event._id) ||
        p.events.some((e) => e === event._id || e?._id === event._id)
      );
      return matchesYear && matchesPocOrSchool && hasEvent;
    }).length;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate Dance limit before submission
    for (const eventId of credentials.events) {
      const selectedEvent = eventList.find((ev) => ev._id === eventId);
      if (selectedEvent && isDanceEvent(selectedEvent)) {
        const count = getDanceParticipantsCount(selectedEvent);
        if (count >= 3) {
          setErrorMessage(`Cannot add participant. Maximum limit (3) for "${selectedEvent.eventName}" has already been reached for this POC/school.`);
          setShowError(true);
          return;
        }
      }
    }
    setLoading(true);
    const formData = new FormData();
    formData.append("name", credentials.name);
    formData.append("class", credentials.class);
    formData.append("phone", credentials.phone);
    formData.append("school", credentials.school);
    formData.append("address", credentials.address);
    formData.append("photo", credentials.photo);
    formData.append("poc", credentials.poc);
    formData.append("events", credentials.events.join(","));

    try {
      const res = await axios.post(`${BASE_URL}/addParticipants`, formData);
      if (res.data === "Participant Added") {
        setShowSuccess(true);
        setCredentials({
          name: "",
          class: "",
          phone: "",
          school: "",
          address: "",
          photo: "",
          poc: "",
          events: [],
        });
        try {
          const updatedParticipants = await axios.get(`${BASE_URL}/participantList`);
          setParticipantList(updatedParticipants.data || []);
        } catch (fetchErr) {
          console.error("Error refreshing participant list:", fetchErr);
        }
      } else {
        setErrorMessage(res.data);
        setShowError(true);
      }
    } catch (err) {
      const serverMsg = err.response?.data?.message || (typeof err.response?.data === "string" ? err.response?.data : null);
      setErrorMessage(serverMsg || "ALL INPUT IS NOT FILLED");
      setShowError(true);
      console.error("error", err);
    } finally {
      setLoading(false);
    }
  };

  const onChange = (e) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
  };

  const onPhotoChange = async (e) => {
    const imageFile = e.target.files[0];
    if (imageFile) {
      // Resize the image and update the credentials state
      const resizedImage = await resizeImage(imageFile);
      const sizeInKB = (resizedImage.size / 1024).toFixed(2); // Calculate size in KB
      setImageSize(`${sizeInKB} KB`);
      setCredentials({ ...credentials, photo: resizedImage });
    }
  };

  const onPocChange = (e) => {
    const selectedPocId = e.target.value;
    const selectedPoc = pocList.find((poc) => poc._id === selectedPocId);

    // Set the selected POC and automatically update the school based on the selected POC
    setCredentials({
      ...credentials,
      poc: selectedPocId,
      school: selectedPoc ? selectedPoc.school : "", // If POC is found, set the school, otherwise leave it blank
    });
  };
  const handleEventChange = (selectedEvent, group) => {
    setCredentials((prevCredentials) => {
      const selectedEventId = selectedEvent._id;
      const isAlreadySelected = prevCredentials.events.includes(selectedEventId);

      // Check if the event is already selected, remove it if so
      if (isAlreadySelected) {
        return {
          ...prevCredentials,
          events: prevCredentials.events.filter((eventId) => eventId !== selectedEventId),
        };
      }

      // Check if selecting a dance event without selecting POC / School first
      if (isDanceEvent(selectedEvent) && !prevCredentials.poc && !prevCredentials.school) {
        setErrorMessage("Please select a Point of Contact (POC) / School first to verify Dance event availability.");
        setShowError(true);
        return prevCredentials;
      }

      // Check if Dance quota (max 3 per school/POC) is already reached
      if (isDanceEvent(selectedEvent)) {
        const danceCount = getDanceParticipantsCount(selectedEvent);
        if (danceCount >= 3) {
          setErrorMessage(`Maximum 3 participants from this School / POC are allowed for "${selectedEvent.eventName}". Limit reached (${danceCount}/3).`);
          setShowError(true);
          return prevCredentials;
        }
      }

      // Check if the max number of events (2) is reached
      if (prevCredentials.events.length >= 2) {
        setErrorMessage("You can only select up to 2 events.");
        setShowError(true);
        return prevCredentials;
      }

      // Ensure only one event per group is selected
      const filteredEvents = prevCredentials.events.filter((eventId) => {
        const event = eventList.find((e) => e._id === eventId);
        return event.eventGroup !== group;
      });

      // Add the newly selected event
      return {
        ...prevCredentials,
        events: [...filteredEvents, selectedEventId],
      };
    });
  };

  return (
    <DashboardLayout>
      <div className="m-2 md:m-10 mt-24 p-2 md:p-10 bg-white rounded-3xl">
        <form onSubmit={handleSubmit} encType="multipart/form-data">
          <div className="space-y-8">
            <div className="border-b border-gray-900/10 pb-8">
              <h2 className="text-base font-bold leading-7 text-gray-900">
                Add Participants Details
              </h2>

              <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
                <div className="sm:col-span-2 sm:col-start-1">
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium leading-6 text-gray-900"
                  >
                    Name
                  </label>
                  <div className="mt-2">
                    <div className="flex rounded-md shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-600 sm:max-w-md">
                      <span className="flex select-none items-center pl-3 text-gray-500 sm:text-sm"></span>
                      <input
                        type="text"
                        name="name"
                        id="name"
                        className="block flex-1 border-0 bg-transparent py-1.5 pl-1 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6"
                        value={credentials.name}
                        onChange={onChange}
                      />
                    </div>
                  </div>
                </div>
                <div className="sm:col-span-3">
                  <label
                    htmlFor="phone"
                    className="block text-sm font-medium leading-6 text-gray-900"
                  >
                    Phone
                  </label>
                  <div className="mt-2">
                    <input
                      type="text"
                      name="phone"
                      id="phone"
                      value={credentials.phone}
                      onChange={onChange}
                      className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                    />
                  </div>
                </div>

                <div className="sm:col-span-2 sm:col-start-1">
                  <label
                    htmlFor="class"
                    className="block text-sm font-medium leading-6 text-gray-900"
                  >
                    Class
                  </label>
                  <div className="mt-2">
                    <select
                      name="class"
                      id="class"
                      value={credentials.class}
                      onChange={onChange}
                      placeholder="Class"
                      className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:max-w-xs sm:text-sm sm:leading-6"
                    >
                      <option value="">Select a class</option>
                      {classes.map((item, index) => (
                        <option key={index} value={item.id}>
                          {item.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="sm:col-span-4">
                  <label
                    htmlFor="poc"
                    className="block text-sm font-medium leading-6 text-gray-900"
                  >
                    Point of Contact
                  </label>
                  <select
                    name="poc"
                    id="poc"
                    value={credentials.poc}
                    onChange={onPocChange} // Updated onChange handler
                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:max-w-xs sm:text-sm sm:leading-6"
                  >
                    <option value="">Select POC</option>
                    {pocList
                      .sort((a, b) => a.nameOfPoc.localeCompare(b.nameOfPoc))
                      .map((poc) => (
                        <option key={poc._id} value={poc._id}>
                          {poc.nameOfPoc} - {poc.school}
                        </option>
                      ))}
                  </select>
                </div>
                {/* <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6"> */}
                <div className="sm:col-span-3">
                  <label
                    htmlFor="school"
                    className="block text-sm font-medium leading-6 text-gray-900"
                  >
                    School
                  </label>
                  <div className="mt-2">
                    <input
                      type="text"
                      name="school"
                      id="school"
                      value={credentials.school}
                      onChange={onChange}
                      className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                    />
                  </div>
                </div>



                <div className="col-span-full">
                  <label
                    htmlFor="address"
                    className="block text-sm font-medium leading-6 text-gray-900"
                  >
                    Complete Address
                  </label>
                  <div className="mt-2">
                    <textarea
                      id="address"
                      name="address"
                      value={credentials.address}
                      onChange={onChange}
                      rows={3}
                      className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                    />
                  </div>
                  <p className="mt-3 text-sm leading-6 text-gray-600">
                    Mention all possible details.
                  </p>
                </div>

                <div className="col-span-full">
                  <label
                    htmlFor="photo"
                    className="block text-sm font-medium leading-6 text-gray-900"
                  >
                    Photo
                  </label>
                  <input
                    type="file"
                    name="photo"
                    accept=".png, .jpg, .jpeg,capture=camera"
                    // Specify 'camera' to use the device's camera
                    onChange={onPhotoChange}
                  />
                  {imageSize && (
                    <p className="text-sm mt-2 ">
                      Uploaded image size:{" "}
                      <span
                        className={
                          parseFloat(imageSize) > 1024
                            ? "text-red-600"
                            : "text-green-600"
                        }
                      >
                        {imageSize}
                      </span>
                    </p>
                  )}
                  {parseFloat(imageSize) > 1024 && (
                    <p className="text-sm text-red-600 mt-1">
                      Please upload a compressed image.
                    </p>
                  )}
                </div>



                <div className="sm:col-span-4">
                  <label
                    htmlFor="events"
                    className="block text-sm font-medium leading-6 text-gray-900"
                  >
                    Select up to 2 events, but only one event per group.
                  </label>

                  <div className="mt-2 flex flex-col gap-2">
                    {Object.entries(
                      eventList.reduce((acc, event) => {
                        // Group events by eventGroup
                        if (!acc[event.eventGroup]) {
                          acc[event.eventGroup] = [];
                        }
                        acc[event.eventGroup].push(event);
                        return acc;
                      }, {})
                    ).map(([group, events]) => (
                      <div key={group} className="mb-4">
                        <h3 className="text-lg font-bold text-gray-900">Event-{group}</h3>
                        <div className="flex flex-col gap-2 mt-2">
                          {events
                            .sort((a, b) => a.eventName.localeCompare(b.eventName))
                            .map((event) => {
                              const isDance = isDanceEvent(event);
                              const danceCount = isDance ? getDanceParticipantsCount(event) : 0;
                              const isQuotaFull = isDance && danceCount >= 3;
                              const isChecked = credentials.events.includes(event._id);

                              return (
                                <div key={event._id} className="flex items-center justify-between py-1 max-w-md">
                                  <div className="flex items-center">
                                    <input
                                      type="checkbox"
                                      value={event._id}
                                      onChange={() => handleEventChange(event, group)}
                                      checked={isChecked}
                                      disabled={isQuotaFull && !isChecked}
                                      className="mr-2 disabled:opacity-50"
                                    />
                                    <label className={`text-sm ${isQuotaFull && !isChecked ? "text-gray-400 cursor-not-allowed" : "text-gray-900 cursor-pointer"}`}>
                                      {event.eventName}
                                    </label>
                                  </div>
                                  {isDance && (credentials.poc || credentials.school) && (
                                    <span
                                      className={`text-xs px-2 py-0.5 rounded-full font-medium ${isQuotaFull
                                        ? "bg-red-100 text-red-700"
                                        : danceCount === 2
                                          ? "bg-amber-100 text-amber-700"
                                          : "bg-emerald-100 text-emerald-700"
                                        }`}
                                    >
                                      {isQuotaFull
                                        ? "School quota full (3/3)"
                                        : `School quota: ${danceCount}/3`}
                                    </span>
                                  )}
                                </div>
                              );
                            })}
                        </div>
                      </div>
                    ))}
                  </div>

                </div>

                {/* Existing fields continue here... */}
              </div>
            </div>
          </div>

          <div className="mt-6 flex items-center justify-end gap-x-6">
            <button
              type="button"
              className="text-sm font-semibold leading-6 text-gray-900"
              onClick={() => window.history.back()}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50"
            >
              {loading ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
        <ErrorMessageModel
          isOpen={showError}
          onClose={() => setShowError(false)}
          onRetry={() => setShowError(false)}
          title="Error"
          message={errorMessage}
        />
        {showSuccess && (
          <SuccessMessage
            message="Participant submitted successfully!"
            onClose={() => setShowSuccess(false)}
          />
        )}
      </div>
    </DashboardLayout>
  );
};

export default AddAntyodayaParticipant;
