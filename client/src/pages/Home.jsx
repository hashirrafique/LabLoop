import { Link } from 'react-router-dom'

function Home() {
  return (
    <div className="card">
      <h2>Welcome to LabLoop</h2>
      <p>
        LabLoop is the online lending system for our department lab. Students can see what
        equipment the lab has, check if it is free for the dates they need and send a borrow
        request without going to the lab first.
      </p>
      <p>
        New here? <Link to="/register">Create a student account</Link> with your university email.
      </p>
      <p className="muted">First version, features are being added sprint by sprint.</p>
    </div>
  )
}

export default Home
