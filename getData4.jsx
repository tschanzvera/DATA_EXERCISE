// const Pagination = ({ items, pageSize, onPageChange }) => {
//   const { Button } = ReactBootstrap;
//   if (items.length <= 1) return null;

//   let num = Math.ceil(items.length / pageSize);
//   let pages = range(1, num + 1);
//   const list = pages.map(page => {
//     return (
//       <Button key={page} onClick={onPageChange} className="page-item">
//         {page}
//       </Button>
//     );
//   });
//   return (
//     <nav>
//       <ul className="pagination">{list}</ul>
//     </nav>
//   );
// };

const Pagination = ({ items, pageSizeOptions, defaultPageSize, onPageChange }) => {
  const { Button, Form } = ReactBootstrap;
  if (items.length <= 1) return null;

  const [pageSize, setPageSize] = React.useState(defaultPageSize);

  let num = Math.ceil(items.length / pageSize);
  let pages = range(1, num + 1);

  const handlePageSizeChange = (event) => {
    const newSize = parseInt(event.target.value, 10);
    setPageSize(newSize);
    onPageChange(1, newSize); // Reset to the first page when changing page size
  };

  const list = pages.map((page) => {
    return (
     
      <Button key={page} variant="warning" onClick={() => onPageChange(page, pageSize)} className="page-item">
        {page} 
      </Button>
     
    );
  });

  return (
    <nav>
      <ul className="pagination">{list}</ul>
      <Form.Group controlId="pageSizeSelect">
        <Form.Label>Items per page:</Form.Label>
        <Form.Control as="select" value={pageSize} onChange={handlePageSizeChange}>
          {pageSizeOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </Form.Control>
      </Form.Group>
    </nav>
  );
};
const range = (start, end) => {
  return Array(end - start + 1)
    .fill(0)
    .map((item, i) => start + i);
};
function paginate(items, pageNumber, pageSize) {
  const start = (pageNumber - 1) * pageSize;
  let page = items.slice(start, start + pageSize);
  return page;
}
const useDataApi = (initialUrl, initialData) => {
  const { useState, useEffect, useReducer } = React;
  const [url, setUrl] = useState(initialUrl);

  const [state, dispatch] = useReducer(dataFetchReducer, {
    isLoading: false,
    isError: false,
    data: initialData
  });

  useEffect(() => {
    let didCancel = false;
    const fetchData = async () => {
      dispatch({ type: "FETCH_INIT" });
      try {
        const result = await axios(url);
        if (!didCancel) {
          dispatch({ type: "FETCH_SUCCESS", payload: result.data });
        }
      } catch (error) {
        if (!didCancel) {
          dispatch({ type: "FETCH_FAILURE" });
        }
      }
    };
    fetchData();
    return () => {
      didCancel = true;
    };
  }, [url]);
  return [state, setUrl];
};
const dataFetchReducer = (state, action) => {
  switch (action.type) {
    case "FETCH_INIT":
      return {
        ...state,
        isLoading: true,
        isError: false
      };
    case "FETCH_SUCCESS":
      return {
        ...state,
        isLoading: false,
        isError: false,
        data: action.payload
      };
    case "FETCH_FAILURE":
      return {
        ...state,
        isLoading: false,
        isError: true
      };
    default:
      throw new Error(); 
    }
};
// App that gets data from Hacker News url
function App() {
  const { useState } = React;
  const { ListGroup , Button} = ReactBootstrap;
  const [query, setQuery] = useState("MIT");
  const [{currentPage, pageSize}, setPage] = useState({currentPage: 1, pageSize: 10});
 
  const [{ data, isLoading, isError }, doFetch] = useDataApi(
    "https://hn.algolia.com/api/v1/search?query=MIT",
    {
      hits: []
    }
  );
  const handlePageChange = (newPage, newPageSize) => {
    setPage({currentPage: newPage, pageSize: newPageSize});
   
  };
  let page = data.hits;
  if (page.length >= 1) {
    page = paginate(page, currentPage, pageSize);
    console.log(`currentPage: ${currentPage}`);
  }
  return (
    <>
      <form
        onSubmit={event => {
          doFetch(`https://hn.algolia.com/api/v1/search?query=${query}`);
          event.preventDefault();
        }}
      >
        <input
          type="text"
          value={query}
          onChange={event => setQuery(event.target.value)}
        />
        <Button type="submit" variant="info">Search</Button>
      </form>

      {isError && <div>Something went wrong ...</div>}

      {isLoading ? (
        <div>Loading ...</div>
      ) : (
        <ListGroup>
          {page.map(item => (
            <ListGroup.Item key={item.objectID}>
             <a href={item.url}>{item.title}</a>
            </ListGroup.Item>
          ))}
        </ListGroup>
      )}
      {!isLoading && !isError && (  //??
      <Pagination
        items={data.hits}
        pageSizeOptions={[5,10,20]}
        onPageChange={handlePageChange}
        defaultPageSize={10}
      ></Pagination>
      )}
    </>
  );
          }          

// ========================================
ReactDOM.render(<App />, document.getElementById("root"));

 
