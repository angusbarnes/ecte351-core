import { useLocation, Link } from "react-router-dom";

function parseUrlPath(url) {
  const segments = url.split("/").filter(Boolean);

  let currentPath = "";
  const result = segments.map((segment) => {
    currentPath += `/${segment}`;
    return { segment, path: currentPath };
  });

  return result;
}

function Breadcrumb() {
  const location = useLocation();

  const segments = parseUrlPath(location.pathname);

  return (
    <div className="text-muted-foreground border-black border-b-2">
      {segments.map((seg) => {
        return (
          <>
            <p>{">"}</p>
            <Link to={seg.path}>{seg.segment}</Link>
          </>
        );
      })}
    </div>
  );
}


export { Breadcrumb }