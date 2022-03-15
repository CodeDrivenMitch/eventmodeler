export const defaultValue = "" +
    "# First set the context and define members  \n" +
    "context Inventory \n" +
    "# The inventory context has a simple event to create the room \n" +
    "Agg Room :: CreateRoom -> RoomCreated\n" +
    "\n" +
    "# Adding the room to Inventory will mark it as added\n" +
    "Agg Room :: AddRoomToInventory -> RoomAddedToInventory\n" +
    "View room :: RoomCreated, RoomAddedToInventory \n" +
    "\n" +
    "\n" +
    "# the Booking context is called through a saga\n" +
    "context Booking \n" +
    "s BookingInventory :: Inventory RoomAddedToInventory -> Booking AddRoom  \n" +
    "a Room :: AddRoom -> RoomAdded \n" +
    "s BookingInventory :: Booking RoomAdded -> Inventory MarkRoomAsAddedToBookingSystem  \n" +
    "\n" +
    "\n" +
    "# And the saga calls back the inventory context\n" +
    "context Inventory\n" +
    "a Room :: MarkRoomAsAddedToBookingSystem -> RoomAddedToBookingSystem,RoomAddedToBookingSystemFailed\n" +
    "v room :: RoomAddedToBookingSystem \n" +
    "\n" +
    "\n" +
    "\n"
