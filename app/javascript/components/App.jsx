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
      {item.text}
      <br />
      <Link to={`/items/${item._id}`}>comments</Link>
    </li>
  );
}

function ItemPage() {
  const { id } = useParams();
  const [item, setItem] = useState([]);
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
      <li>{item.text}</li>
      <List {...{ items, action: `/items/${id}/items` }} />
    </ul>
  );
}

function List({ items, action }) {
  // return <h1>Hello, React with Vite-Rails</h1>;
  return (
    <>
      <ul>
        <li>
          <form action={action} method="POST" rel="external">
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
    <Router>
      <Routes>
        <Route path="/" element={<RootPage />} />
        <Route path="/items/:id" element={<ItemPage />} />
      </Routes>
    </Router>
  );
  return <Root />;
}
