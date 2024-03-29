import shortid from 'shortid';
import { Player } from '../types/Player';
import { Room } from '../types/Room';
import { DatabaseService } from './Db.service';
import { DeviceDataService } from './DeviceData.service';

const RoomsRef = DatabaseService.child('rooms');

function createRoom(roomName: string): Promise<string> {
  return RoomsRef.once('value').then((snapshot) => {
    const rooms = snapshot.val() || {};

    const roomId = shortid.generate();
    if (roomId in rooms) {
      // try a couple times?
      throw new Error('couldnt create new room b/c of id collision');
    }

    const deviceData = DeviceDataService.getDeviceData();
    if (!deviceData) {
      throw new Error('deviceData not defined');
    }

    return new Promise((resolve, reject) => {
      RoomsRef.child(roomId).set(
        new Room(roomName, deviceData.userId, deviceData.name),
        (err) => {
          if (err) {
            reject(err);
          } else {
            resolve(roomId);
          }
        }
      );
    });
  });
}

function onRoomUpdate(roomId: string, callback: (room: Room | null) => void) {
  RoomsRef.child(roomId).on('value', (snapshot) => callback(snapshot.val()));
}

function addRoomPlayer(roomId: string, userId: string, name: string) {
  RoomsRef.child(roomId).child('players').child(userId).set(new Player(name));
}

function removeRoomPlayer(roomId: string, userId: string) {
  RoomsRef.child(roomId).child('players').child(userId).remove();
}

function updateRoomPlayer(
  roomId: string,
  userId: string,
  updatedPlayer: Partial<Player>
) {
  RoomsRef.child(roomId).child('players').child(userId).update(updatedPlayer);
}

function flipAllRoomCards(roomId: string, currentRoom: Room) {
  const players = currentRoom.players;
  Object.entries(players).forEach(([_userId, player]) => {
    if (player.value) {
      player.flipped = true;
    }
  });

  RoomsRef.child(roomId).child('players').update(players);
}

function resetAllRoomCards(roomId: string, currentRoom: Room) {
  const players = currentRoom.players;
  Object.entries(players).forEach(([_userId, player]) => {
    player.value = '';
    player.flipped = false;
  });

  RoomsRef.child(roomId).child('players').update(players);
}

export const RoomsService = {
  createRoom,
  onRoomUpdate,
  addRoomPlayer,
  removeRoomPlayer,
  updateRoomPlayer,
  flipAllRoomCards,
  resetAllRoomCards,
};
