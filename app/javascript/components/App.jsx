// import React, { useState } from "react";
// import React, { Suspense } from "react";
// import useSWR from "swr";
import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  useParams,
} from "react-router-dom";

function ListItem({ item }) {
  return (
    <li key={item._id}>
      { item.user.auths[0].email }
      <br />
      {item.text}{/* <Link to={`/items/${item._id}/upvote`}>+1</Link> */}
      <br />
      <Link to={`/items/${item._id}`}>comments</Link>
    </li>
  );
}

function ItemPage() {
  const { id } = useParams();
  const [item, setItem] = useState({});
  useEffect(() => {
    fetch(`/items/${id}.json`).then((res) => res.json().then(setItem));
  }, []);

  const [items, setItems] = useState([]);
  useEffect(() => {
    item &&
      fetch(`/items/${id}/items.json`).then((res) => res.json().then(setItems));
  }, [item]);

  return (
    <ul>
      <li>
        <div>
          {/*
          <form action={`/items/${id}`} method="PATCH">
            Labels:{" "}
            <input type="text" name="item[labels]" value={item.labels} />}
            <button>update</button>
          </form>
          */}
        </div>
        {item.text}
        <List {...{ items, action: `/items/${id}/items` }} />
      </li>
    </ul>
  );
}

function List({ items, action }) {
  const token = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');

  return (
    <>
      <ul>
        <li>
          <form action={action} method="POST">
            <input type="hidden" name="authenticity_token" value={token} />
            <textarea name="item[text]"></textarea>
            <button type="submit">post</button>
          </form>
        </li>
        {items?.map((item) => {
          return <ListItem {...{ item }} />;
        })}
      </ul>
    </>
  );
}

function Login() {
  const [authUser, setAuthUser] = useState();

  useEffect(() => {
    fetch('/auth/user').then(res => res.json()).then(setAuthUser);
  }, []);

  const token = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');

  if (authUser) {
    return (
      <form method="delete" action="/auth/session">
        <span>{authUser.email}</span>
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
  const [items, setItems] = useState([]);
  useEffect(() => {
    fetch("/items.json").then((res) => res.json().then(setItems));
  }, []);

  return <List {...{ items, action: "/items" }} />;
}

export default function App() {
  return (
    <>
      <Login />
      <Router>
        <Routes>
          <Route path="/" element={<RootPage />} />
          <Route path="/items/:id" element={<ItemPage />} />
        </Routes>
      </Router>
    </>
  );
  return <Root />;
}
