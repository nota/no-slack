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
  useLocation
} from "react-router-dom";

const AuthUserContext = createContext();
const ItemsContext = createContext();

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

function Participants({ item }) {
  return (
    <span style={{display: 'inline-flex', gap:'0.5em'}}>
      {
        item.participants?.map((p) => {
          return (
            <span key={p._id}>
              <input type='checkbox' checked={!p.actor} disabled />
              {p.user?.name}
            </span>
          );
        })
      }
    </span>
  );
}

function ListItem({ item }) {
  return (
    <li key={item._id} className='item'>
      <Item {...{item}} />
      <div style={{color: "gray", fontSize: "0.8em"}}>
        <Link key='comments' to={`/items/${item._id}`} style={{color: "gray"}}>{item.count_children} comments</Link>
        <Participants {...{item}} />
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
  const [reload, setReload] = useState(Date.now());
  useEffect(() => {
    item &&
      fetch(`/items/${id}/items.json`).then((res) => res.json().then(setItems));
  }, [item, reload]);

  if (!item) {
    return;
  }

  return (
    <ItemsContext.Provider value={{reload, setReload}}>
      <div style={{display: 'flex', gap: '0.5em'}}>
        <Link to='/'>root</Link>
        {
          item.parent_id && <Link to={`/items/${item.parent_id}`}>parent</Link>
        }
      </div>
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
            <div className='item'>
              <Item {...{item}} />
              <Participants {...{item}} />
            </div>
            <List {...{ items, action: `/items/${id}/items`, parent: item }} />
          </li>
        </ul>
      }
    </ItemsContext.Provider>
  );
}

function UserInput({userIds}) {
  const [suggests, setSuggests] = useState([]);
  const [users, setUsers] = useState([]);
  const [value, setValue] = useState('');

  useEffect(() => {
    const params = new URLSearchParams();
    userIds.forEach(id => params.append('user_ids[]', id));

    fetch(`/users?${params.toString()}`).then((res) => res.json()).then(setUsers);
  }, [userIds]);

  const handleActive = (e) => {
    const name = e.target.value;
    setValue(name);

    const params = new URLSearchParams({name});
    // const excepts = users.map(u => u._id);
    users.forEach(u => params.append('excepts[]', u._id));
    fetch(`/users?${params.toString()}`).then((res) => res.json()).then(setSuggests);
  };

  const handleBlur = () => {
    setTimeout(() => setSuggests([]), 100);
  };

  const handleClick = (user) => {
    setUsers([...users, user]);
  };

  const style = {
    wrapper: {
      position: 'relative',
      display: 'inline-block'
    },
    input: {
      width: '10em'
    },
    list: {
      position: 'absolute',
      left: '0',
      width: '10em',
      border: suggests.length > 0 && 'solid 1px',
      padding: '0',
      listStyle: 'none',
      backgroundColor: 'white'
    },
  };

  const removeUser = (userId) => {
    setUsers(users.filter(user => user._id !== userId));
  };

  return (
    <span style={{display: 'flex', gap: '0.5em'}}>
      {
        users.map((user, i) => {
          return (
            <span key={i} tabIndex='0' className='focusable clickable'>
              @{ user.name }
              <input type='hidden' name='participants[]user_id' value={user._id} />
              <button type='button' className='btn' onMouseDown={() => removeUser(user._id)}>X</button>
            </span>
          );
        })
      }
      <div style={style.wrapper}>
        <input
          type='text'
          placeholder='participants'
          value={value}
          onChange={handleActive}
          onFocus={handleActive}
          onBlur={handleBlur}
          style={style.input}
          onKeyDown={(e) => {if(event.key === 'Enter'){e.preventDefault()}}}
        />
        <ul style={style.list}>
          {
            suggests.map((user, i) => {
              return <li key={i} onClick={() => handleClick(user)} className='clickable'>{user.name}</li>;
            })
          }
        </ul>
      </div>
    </span>
  );
}

function ItemForm({action, parent}) {
  const token = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
  const [searchParams] = useSearchParams();
  const actor = searchParams.get('actor');
  const { setReload } = useContext(ItemsContext);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const form = event.target;
    const response = await fetch(action, {
      method: 'POST',
      body: new FormData(form)
    });
    if (response.ok) {
      form.reset();
      setReload(Date.now())
    } else {
      // TODO: error handling
    }
  };

  return (
    <>
      <form action={action} method="POST" onSubmit={handleSubmit}>
        <UserInput userIds={[actor]} />
        <input type="hidden" name="authenticity_token" value={token} />
        <textarea
          name="item[text]"
          style={{maxWidth: '480px', width: '100%', border: '1px solid lightgray'}
        }>
        </textarea>
        <br/>
        <button type="submit">post</button>
        { parent &&
          <label>
            <input type='checkbox' name='done' />
            done
          </label>
        }
      </form>
    </>
  );
}

function List({ items, action, parent }) {
  return (
    <>
      <ol start='0'>
        <li style={{marginBottom: "1em"}}>
          <ItemForm {...{action, parent}}/>
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

function LinkToUnlessCurrent({ to, children, ...props }) {
  const location = useLocation();
  const loc = location.pathname + location.search;
  if (loc  === to) {
    return <span {...props}>{children}</span>;
  }
  return <Link to={to} {...props}>{children}</Link>;
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
  const query = searchParams.toString();

  const [items, setItems] = useState([]);
  const [reload, setReload] = useState(Date.now());
  useEffect(() => {
    fetch(`/items.json?${query}`).then((res) => res.json().then(setItems));
  }, [searchParams, reload]);

  return (
    <ItemsContext.Provider value={{reload, setReload}}>
      <div style={{display: 'flex', gap: '0.6em'}}>
        <LinkToUnlessCurrent to='/'>all</LinkToUnlessCurrent>
        <LinkToUnlessCurrent to={`/?actor=${authUser?._id}`}>my items</LinkToUnlessCurrent>
        <LinkToUnlessCurrent to={`/?waiting=${authUser?._id}`}>waiting</LinkToUnlessCurrent>
      </div>
      <List {...{ items, action: '/items' }} />
    </ItemsContext.Provider>
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
