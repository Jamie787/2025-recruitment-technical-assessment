import data from '../data.json';
import './App.css';

// I ran out of time to make this

function App() {
  return (
    <>
      {
        data.map((room) => <Room 
          room={room.name} 
          rooms_available={room.rooms_available} 
          building_picture={room.building_picture}/>)
      }
    </>
  )
}

interface RoomInformation {
  room: string;
  rooms_available: number;
  building_picture: string;
}

function Room({ room, rooms_available, building_picture }: RoomInformation) {
  return (
  <div className='roomContainer'>
    <img src={building_picture} className='roomImage'/>
    <div className='roomAvaliable'>
      <span className='roomAvaliableText'><span className='greenDot'/>{`${rooms_available} rooms avaliable`}</span>
    </div>
    <div className='roomName'>
      <p className='roomNameText'>{room}</p>
    </div>
  </div>
  );
}

export default App
