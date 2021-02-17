import './App.css';

function Home() {
    return (
        <div className = "centered-form">
            <div className = "centered-form__form">
                <form action = "/chat">
                    <div className = "form-field"><h3>Join Chat</h3></div>
                    <div className = "form-field">
                        <label>Display name</label>
                        <input type="text" name="name" ></input>
                    </div>
                    <div className = "form-field">
                        <label>Room name</label>
                        <input type="text" name="room" autofocus></input>
                    </div>
                    <div className = "form-field"><button>Join</button></div>
                </form>
            </div>
        </div>
    )
}

export default Home;