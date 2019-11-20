import React from 'react';
import { Link, Route, Switch, BrowserRouter as Router } from "react-router-dom"

class App extends React.Component {
  constructor() {
    super();
    this.state = {
      items: []
    }
  }

  takeBook = () => {
    let book = document.getElementById("bookName").value
    console.log(book)
    fetch('/getBookInfo', {
      headers: {
        'Content-Type': 'application/json'
      },
      method: 'POST',
      body: JSON.stringify({ book })

    })
      .then(r => r.json())
      .then(r => {
        let items = r.items;

        this.setState({ items }, () => {
          console.log(this.state.items)

        })
      })
  }

  render() {
    // if (this.state.items.length === 0) {
    //   return (
    //     <Router>
    //       <div>
    //         <nav>
    //           <ul>
    //             <li>
    //               <Link to="/">Home</Link>
    //             </li>
    //           </ul>
    //         </nav>
    //         <Switch>
    //           <Route path="/">
    //             <Home takeBook={this.takeBook} />
    //           </Route>
    //         </Switch>
    //       </div>
    //     </Router>
    //   );
    // } else {
    //   return (
    //     <div>
    //       <Router>
    //         <div>
    //           <nav>
    //             <ul>
    //               <li>
    //                 <Link to="/">Home</Link>
    //               </li>
    //             </ul>
    //           </nav>
    //           <Switch>
    //             <Route path="/">
    //               <Home takeBook={this.takeBook} />
    //             </Route>
    //           </Switch>
    //         </div>
    //       </Router>
    //       <div>{this.state.items.map(item => <p>{item.id}</p>)}</div>
    //     </div>
    //   )
    // }

    return (
      <Router>
        <div>
          <nav>
            <ul>
              <li>
                <Link to="/">Home</Link>
              </li>
            </ul>
          </nav>
          <Switch>
            <Route path="/">
              <Home takeBook={this.takeBook} />
            </Route>
          </Switch>
        </div>
        <div>
          {(this.state.items.length > 0) ? this.state.items.map(items => <p key={items.id}>

            {items.volumeInfo.title} <br />
            {items.searchInfo.textSnippet}<br />
            {items.volumeInfo.authors}<br />
            {items.volumeInfo.imageLinks.smallThumbnail
            }<br /></p>) : false}
        </div>
      </Router>
    );


  }
}

const Home = (props) => (
  <div>
    <h1>Home</h1>
    <input id="bookName"></input> <button onClick={props.takeBook}>Search</button>
  </div>
)


export default App