import React, { Component } from 'react'

import { withAuthenticator } from 'aws-amplify-react'; // Signs in to view project
import { API, graphqlOperation } from 'aws-amplify';
import { createNote, deleteNote, updateNote } from './graphql/mutations';
import { listNotes } from './graphql/queries';


export class App extends Component {

  state = {
    id: '',
    note:'',
    notes: []
  }

  async componentDidMount() {
    const result = await API.graphql(graphqlOperation(listNotes)) // Fetch ALL Notes
    this.setState({ notes : result.data.listNotes.items }) // Add them to Notes
  }

  // on CHANGE
  handleChangeNote = e => this.setState({ note: e.target.value })

  // Checks for existing note
  hasExistingNote = () => {
    const { id, notes } = this.state // Take ID and NOTE from state
    if (id) { // if we have an ID in state
      const isNote = notes.findIndex(note => note.id === id) > -1 // Finds index of note that has SAME ID AS NOTE TO UPDATE -- if whats found is > -1 it'll return TRUE
      return isNote // Returns TRUE or FALSE
    } 
    return false; // otherwise return false
  }

  // on SUBMIT
  handleAddNote = async (e) => { 
    const { note, notes } = this.state // Take NOTE and NOTES from state
      // const { note, notes, id } = this.state // Take NOTE, NOTES and ID from state
    e.preventDefault()
    // Check if we have existing note, if so update it
      // if (notes.findIndex(note => note.id === id) > -1) {
      //   this.handleUpdateNote()
      // }
    if (this.hasExistingNote()) { // if hasExistingNote returns TRUE
      this.handleUpdateNote() // UPDATE NOTE
    } else { // Otherwise --> ADD NEW NOTE
      const input = { note } // Set Input to NOTE from State
      const result = await API.graphql(graphqlOperation(createNote, { input })) // createNote GraphQL call
      const newNote = result.data.createNote // Set NEW NOTE to returned value
      const updatedNotes = [newNote, ...notes] // Add NEW NOTE to beginning of NOTES
      this.setState({ 
        notes: updatedNotes, // reset NOTES to array w/ NEW NOTE
        note: '' // Clear out Input
      })
    }
  }

  // UPDATE NOTE
  handleUpdateNote = async () => {
    const { id, note, notes } = this.state // Take ID, NOTE and NOTES from state
    const input = { id, note } // Set Input as ID and NOTE from state
    const result = await API.graphql(graphqlOperation(updateNote, { input })) // updateNote GraphQL call
    const updatedNote = result.data.updateNote; // Set UPDATED NOTE to returned value
    const index = notes.findIndex( note => note.id === updatedNote.id ) // Find index of Note w/ ID that matched ID of UPDATED NOTE
    // Create NEW ARRAY of Updated Notes
    const updatedNotes = [
      ...notes.slice(0, index), // First add notes from beginning to INDEX OF UPDATED NOTE
      updatedNote, // Then add UPDATED NOTE
      ...notes.slice(index + 1) // Then add remaining notes from INDEX OF UPDATED NOTE to end
    ]
    this.setState({ 
      id: '', // Reset ID
      note: '', // Reset Note Input
      notes: updatedNotes // Set Notes to NEW ARRAY of Updated Notes
    })
  }

  // DELETE NOTE
  handleDeleteNote = async (noteId) => { // takes in ID
    const { notes } = this.state // grab notes from state
    const input = { id: noteId } // set input to ID from note being deleted
    const result = await API.graphql(graphqlOperation(deleteNote, { input })) // deleteNote GraphQL call
    const deletedNoteId = result.data.deleteNote.id; // take ID of DELETED NOTE
    const updatedNotes = notes.filter(note => note.id !== deletedNoteId) // Filter out all notes that DONT HAVE ID OF DELETED NOTE
    this.setState({ notes: updatedNotes }) // Reset Notes without deleted note
  }

  // Set State with Note that was Clicked
  handleSetNote = ( { note, id } ) => { // takes NOTE and ID from CLICKED NOTE
    this.setState( { 
      id,  // Sets ID
      note // Sets Note
    } )
  }

  

  render() {
    const { id, note, notes } = this.state; // Deconstruct State

    return (
      <div className='flex flex-column items-center justify-center pa3 bg-washed-red'>
        <h1 className="code f2-l">Amplify Notetaker</h1>
        <form className="mb3" onSubmit={this.handleAddNote}>
          <input 
            type="text" 
            className="pa2 f4"
            placeholder='Write your note'
            onChange={this.handleChangeNote}
            value={note}
          />
          <button className="pa2 f4" type='submit'>{id ? "Update Note" : "Add Note"}</button>
        </form>
        <div>
          {notes.map(item => (
            <div key={item.id} className="flex items-center">
              <li className="list pa1 f3" onClick={()=>this.handleSetNote(item)}>{item.note}</li>
              <button className="bg-transparent bn f4" onClick={()=>this.handleDeleteNote(item.id)}><span>&times;</span></button>
            </div>
          ))}
        </div>
      </div>
    )
  }
}

export default withAuthenticator(App, { includeGreetings:true }); // includes signout
