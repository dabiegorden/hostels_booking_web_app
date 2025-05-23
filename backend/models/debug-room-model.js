// This is a debugging script to check your Room model structure
// You can run this on your server to verify the schema

const Room = require("../models/Room")

// Function to inspect the Room model schema
const inspectRoomModel = () => {
  console.log("Room Model Schema:")
  console.log(JSON.stringify(Room.schema.paths, null, 2))

  console.log("\nRoom Model hostelId field type:")
  if (Room.schema.paths.hostelId) {
    console.log(Room.schema.paths.hostelId.instance)
    console.log(Room.schema.paths.hostelId.options)
  } else {
    console.log("hostelId field not found in schema!")
  }
}

// Function to check a sample room
const checkSampleRoom = async () => {
  try {
    const sampleRoom = await Room.findOne()
    if (sampleRoom) {
      console.log("\nSample Room Document:")
      console.log(JSON.stringify(sampleRoom, null, 2))

      console.log("\nhostelId type:", typeof sampleRoom.hostelId)
      console.log("hostelId value:", sampleRoom.hostelId)

      if (sampleRoom.hostelId && sampleRoom.hostelId.toString) {
        console.log("hostelId as string:", sampleRoom.hostelId.toString())
      }
    } else {
      console.log("No rooms found in database")
    }
  } catch (err) {
    console.error("Error checking sample room:", err)
  }
}

// Run the inspection
inspectRoomModel()
checkSampleRoom()
