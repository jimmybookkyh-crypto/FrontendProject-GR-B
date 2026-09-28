import { Row } from "react-bootstrap";


export default function BookingPage() {
  const rows = [
    ["A1", "A2", "A3", "A4", "A5"],
    ["B1", "B2", "B3", "B4", "B5"],
    ["C1", "C2", "C3", "C4", "C5"],
    ["D1", "D2", "D3", "D4", "D5"],
  ];

  return <>

    <section className="MovieContainer">
     <img className="MovieImg"/>
     <article className="MovieInfo">
      <p>Film</p>
      <p>Datum</p>
      <p>Tid</p>
      <p>Salong</p>
</article>
    </section>
    
    <section className="Auditorium">
      <article className="Screen">

        </article>
      <article className="Seat-map">
      
        {rows.map((row) => (
          <div key = { row[0]}
            className="d-flex justify-content-center gap-2 mb-2" >
        {
            row.map((seat) => (
              <button key={seat} className="seat seat-avalible" >
                {seat}
              </button>
            
            ))}
          </div>
        ))}
       
          

        {/* <div className="d-flex justify-content-center gap-2 mb-2">
          <button className="btn btn-success">A1</button>
          <button className="btn btn-success">A2</button>
          <button className="btn btn-success">A3</button>
          <button className="btn btn-success">A4</button>
          <button className="btn btn-success">A5</button>
          <button className="btn btn-success">A6</button>
          <button className="btn btn-success">A7</button>
          <button className="btn btn-success">A8</button>
        </div>
        <div className="d-flex justify-content-center gap-2 mb-2">
          <button className="btn btn-success">A1</button>
          <button className="btn btn-success">A2</button>
          <button className="btn btn-success">A3</button>
          <button className="btn btn-success">A4</button>
          <button className="btn btn-success">A5</button>
          <button className="btn btn-success">A6</button>
          <button className="btn btn-success">A7</button>
          <button className="btn btn-success">A8</button>
          <button className="btn btn-success">A9</button>
        </div>
        <div className="d-flex justify-content-center gap-2 mb-2">
          <button className="btn btn-success">A1</button>
          <button className="btn btn-success">A2</button>
          <button className="btn btn-success">A3</button>
          <button className="btn btn-success">A4</button>
          <button className="btn btn-success">A5</button>
          <button className="btn btn-success">A6</button>
          <button className="btn btn-success">A7</button>
          <button className="btn btn-success">A8</button>
          <button className="btn btn-success">A9</button>
          <button className="btn btn-success">A10</button>
        </div>
        <div className="d-flex justify-content-center gap-2 mb-2">
          <button className="btn btn-success">A1</button>
          <button className="btn btn-success">A2</button>
          <button className="btn btn-success">A3</button>
          <button className="btn btn-success">A4</button>
          <button className="btn btn-success">A5</button>
          <button className="btn btn-success">A6</button>
          <button className="btn btn-success">A7</button>
          <button className="btn btn-success">A8</button>
          <button className="btn btn-success">A9</button>
          <button className="btn btn-success">A10</button>
        </div>
        <div className="d-flex justify-content-center gap-2 mb-2">
          <button className="btn btn-success">A1</button>
          <button className="btn btn-success">A2</button>
          <button className="btn btn-success">A3</button>
          <button className="btn btn-success">A4</button>
          <button className="btn btn-success">A5</button>
          <button className="btn btn-success">A6</button>
          <button className="btn btn-success">A7</button>
          <button className="btn btn-success">A8</button>
          <button className="btn btn-success">A9</button>
          <button className="btn btn-success">A10</button>
        </div>
        <div className="d-flex justify-content-center gap-2 mb-2">
          <button className="btn btn-success">A1</button>
          <button className="btn btn-success">A2</button>
          <button className="btn btn-success">A3</button>
          <button className="btn btn-success">A4</button>
          <button className="btn btn-success">A5</button>
          <button className="btn btn-success">A6</button>
          <button className="btn btn-success">A7</button>
          <button className="btn btn-success">A8</button>
          <button className="btn btn-success">A9</button>
          <button className="btn btn-success">A10</button>
        </div>
        <div className="d-flex justify-content-center gap-2 mb-2">
          <button className="btn btn-success">A1</button>
          <button className="btn btn-success">A2</button>
          <button className="btn btn-success">A3</button>
          <button className="btn btn-success">A4</button>
          <button className="btn btn-success">A5</button>
          <button className="btn btn-success">A6</button>
          <button className="btn btn-success">A7</button>
          <button className="btn btn-success">A8</button>
          <button className="btn btn-success">A9</button>
          <button className="btn btn-success">A10</button>
          <button className="btn btn-success">A11</button>
          <button className="btn btn-success">A12</button>
        </div>
        <div className="d-flex justify-content-center gap-2 mb-2">
          <button className="btn btn-success">A1</button>
          <button className="btn btn-success">A2</button>
          <button className="btn btn-success">A3</button>
          <button className="btn btn-success">A4</button>
          <button className="btn btn-success">A5</button>
          <button className="btn btn-success">A6</button>
          <button className="btn btn-success">A7</button>
          <button className="btn btn-success">A8</button>
          <button className="btn btn-success">A9</button>
          <button className="btn btn-success">A10</button>
          <button className="btn btn-success">A11</button>
          <button className="btn btn-success">A12</button>
        </div> */}
      </article>
    </section>

    <section className="Ticketsinfo">
      <article className="Tickets">
        <p>Vuxen</p>
        <p>Barn</p>
        <p>Pensionär</p>
      </article>
      <article className="summary">
        <p>total</p>
      </article>
      <button className="Bookingbutton"></button>
    </section>

  </>;
}



BookingPage.route = {
  path: "/booking",
  order: 3,
  label: "Bokningssida",
};


/*Designa salongskarta: grafisk skiss av stolar och rader med duk/scen och tydliga lägen (ledig, upptagen, vald, rekommenderad) samt teckenförklaring

Anpassa salongskartan för små skärmar (tillräckligt stora tryckytor, ev. zoom/scroll)

Se filmstadens lösning på responsiv design för mobiler (dragbar touchscreen selector)

Designa hur bästa kvarvarande stolar markeras från start och hur besökaren ändrar valet (klicka på andra stolar)
Initialt ska de bästa kvarvarande stolarna markeras, men besökaren ska kunna ändra valet.

Designa biljettväljare för Vuxen (140 kr), Pensionär (120 kr) och Barn (80 kr) samt löpande visning av totalpris

Designa hur live-uppdatering syns: stol byter läge och hur en redan vald stol som blir upptagen hanteras*/