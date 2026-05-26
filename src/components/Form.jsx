import {useState} from "react";
import axios from 'axios'

export const Form = (props) => {
    const [state, setState] = useState({userName: ''})

    const handleSubmit = async (event) => {
        event.preventDefault()
        const resp =  await axios.get(`https://api.github.com/users/${state.userName}`);
        props.onSubmit(resp.data)
        setState({userName: ''})
    };


        return(
            <form onSubmit={handleSubmit}>
                <input type="text"
                       value={state.userName}
                       onChange={event => setState({userName: event.target.value})}
                       placeholder="Github username" required
                />
                <button>Add Card</button>
            </form>
        )
}