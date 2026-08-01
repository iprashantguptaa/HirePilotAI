const emptyEntry = { school: "", degree: "", field: "", startDate: "", endDate: "" }

const EducationEditor = ({ education, onChange }) => {
    const updateEntry = (index, field, value) => {
        const next = education.map((entry, i) => (i === index ? { ...entry, [ field ]: value } : entry))
        onChange(next)
    }

    const addEntry = () => onChange([ ...education, { ...emptyEntry } ])
    const removeEntry = (index) => onChange(education.filter((_, i) => i !== index))

    return (
        <div className="list-editor">
            {education.map((entry, index) => (
                <div key={index} className="list-editor__entry">
                    <div className="list-editor__row">
                        <input
                            type="text" placeholder="School / University" value={entry.school}
                            onChange={(e) => updateEntry(index, "school", e.target.value)}
                        />
                        <input
                            type="text" placeholder="Degree" value={entry.degree}
                            onChange={(e) => updateEntry(index, "degree", e.target.value)}
                        />
                    </div>
                    <div className="list-editor__row">
                        <input
                            type="text" placeholder="Field of study" value={entry.field}
                            onChange={(e) => updateEntry(index, "field", e.target.value)}
                        />
                        <input
                            type="month" value={entry.startDate ? entry.startDate.slice(0, 7) : ""}
                            onChange={(e) => updateEntry(index, "startDate", e.target.value)}
                        />
                        <input
                            type="month" value={entry.endDate ? entry.endDate.slice(0, 7) : ""}
                            onChange={(e) => updateEntry(index, "endDate", e.target.value)}
                        />
                    </div>
                    <button type="button" className="button ghost-button button-sm" onClick={() => removeEntry(index)}>
                        Remove
                    </button>
                </div>
            ))}
            <button type="button" className="button secondary-button button-sm" onClick={addEntry}>
                + Add education
            </button>
        </div>
    )
}

export default EducationEditor
