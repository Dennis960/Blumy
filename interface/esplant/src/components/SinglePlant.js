import { Container } from "react-bootstrap";
import Plant from "./Plant";

const SinglePlant = () => {
  return (
    <div>
      <center>
        <h1 className="mt-4 mb-2">Plant</h1>
      </center>

      <Container>
        <div className="d-flex flex-wrap justify-content-center">
          <Plant showLink={false} />
        </div>
      </Container>
    </div>
  );
};

export default SinglePlant;
