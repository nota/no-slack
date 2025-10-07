// import React, { useState } from "react";
// import React, { Suspense } from "react";
// import useSWR from "swr";
import React, { useState, useEffect, useContext, createContext, StrictMode } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  useParams,
  useSearchParams,
} from "react-router-dom";

const AuthUserContext = createContext();

function toLocalDateString(dateString) {
  const date = new Date(dateString);

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  // const seconds = String(date.getSeconds()).padStart(2, '0');

  return `${year}-${month}-${day} ${hours}:${minutes}`;
}

function Item({ item }) {
  const email = item.user.auths[0].email;
  const date = toLocalDateString(item.date);

  return (
    <>
      <div style={{color: "gray", fontSize: "0.8em"}}>
        <span title={ email }>{ email.split('@')[0] }</span>
        {' ('}
        <span title={ item.date }>{ date }</span>
        {')'}
      </div>
      <div style={{whiteSpace: 'pre-wrap', padding: '0.5em 0'}}>
        {item.text}
      </div>
      {/* <Link to={`/items/${item._id}/upvote`}>+1</Link> */}
    </>
  );
}

function ListItem({ item }) {
  return (
    <li key={item._id} style={{marginBottom: "1em"}}>
      <Item {...{item}} />
      <div style={{color: "gray", fontSize: "0.8em"}}>
        <Link to={`/items/${item._id}`} style={{color: "gray"}}>{item.count_children} comments</Link>
      </div>
    </li>
  );
}

function ItemPage() {
  const { id } = useParams();
  const [item, setItem] = useState();
  useEffect(() => {
    fetch(`/items/${id}.json`).then((res) => res.json().then(setItem));
  }, [id]);

  const [items, setItems] = useState([]);
  useEffect(() => {
    item &&
      fetch(`/items/${id}/items.json`).then((res) => res.json().then(setItems));
  }, [item]);

  if (!item) {
    return;
  }

  return (
    <>
      {
        item.parent_id
          ? <Link to={`/items/${item.parent_id}`}>parent</Link>
          : <Link to='/'>root</Link>
      }
      { item &&
        <ul>
          <li key={item._id}>
            <div>
              {/*
              <form action={`/items/${id}`} method="PATCH">
                Labels:{" "}
                <input type="text" name="item[labels]" value={item.labels} />}
                <button>update</button>
              </form>
              */}
            </div>
            <Item {...{item}} />
            <List {...{ items, action: `/items/${id}/items` }} />
          </li>
        </ul>
      }
    </>
  );
}

function List({ items, action }) {
  const token = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');

  return (
    <>
      <ol start='0'>
        <li style={{marginBottom: "1em"}}>
          <form action={action} method="POST">
            <input type="hidden" name="authenticity_token" value={token} />
            <textarea name="item[text]" style={{maxWidth: '480px', width: '100%', border: '1px solid lightgray'}}>
            </textarea>
            <button type="submit">post</button>
          </form>
        </li>
        {items?.map((item) => {
          return <ListItem key={item._id} {...{ item }} />;
        })}
      </ol>
    </>
  );
}

function Login() {
  const { authUser, setAuthUser } = useContext(AuthUserContext);
  // const [authUser, setAuthUser] = useState();

  useEffect(() => {
    fetch('/auth/user').then(res => res.json()).then(setAuthUser);
  }, []);

  const token = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');

  if (authUser) {
    return (
      <form method="delete" action="/auth/session">
        <span title={authUser.email}>{authUser.name}</span>
        {" "}
        <input type="hidden" name="authenticity_token" value={token} />
        <button type="submit">Logout</button>
      </form>
    );
  } else {
    return (
      <form method="post" action="/auth/google_oauth2">
        <input type="hidden" name="authenticity_token" value={token} />
        <button type="submit">Login with Google</button>
      </form>
    );
  }
}

function RootPage() {
  // const fetcher = (url) =>
  //   fetch(url).then(async (res) => {
  //     console.log(await res.json());
  //     return res.json();
  //   });
  // const { items, error, isLoading } = useSWR("/items.json", fetcher);
  const { authUser } = useContext(AuthUserContext);
  const [searchParams] = useSearchParams();

  const [items, setItems] = useState([]);
  useEffect(() => {
    fetch(`/items.json?${searchParams.toString()}`).then((res) => res.json().then(setItems));
  }, [searchParams]);

  return (
    <>
      <div>
        <Link to='/'>all</Link>
        {" | "}
        <Link to={`/?assignee=${authUser?.name}`}>my items</Link>
      </div>
      <List {...{ items, action: "/items" }} />
    </>
  );
}

export default function App() {
  const [authUser, setAuthUser] = useState();

  return (
    <AuthUserContext.Provider value={{authUser, setAuthUser}}>
      <StrictMode>
        <Login />
        <hr />
        <Router future={{v7_startTransition: true, v7_relativeSplatPath: true}}>
          <Routes>
            <Route path="/" element={<RootPage />} />
            <Route path="/items/:id" element={<ItemPage />} />
          </Routes>
        </Router>
      </StrictMode>
    </AuthUserContext.Provider>
  );
  return <Root />;
}
