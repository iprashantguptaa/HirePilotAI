const emptyEntry = { title: "", company: "", startDate: "", endDate: "", current: false, description: "" }

const ExperienceEditor = ({ experience, onChange }) => {
    const updateEntry = (index, field, value) => {
        const next = experience.map((entry, i) => (i === index ? { ...entry, [ field ]: value } : entry))
        onChange(next)
    }

    const addEntry = () => onChange([ ...experience, { ...emptyEntry } ])
    const removeEntry = (index) => onChange(experience.filter((_, i) => i !== index))

    return (
        <div className="list-editor">
            {experience.map((entry, index) => (
                <div key={index} className="list-editor__entry">
                    <div className="list-editor__row">
                        <input
                            type="text" placeholder="Job title" value={entry.title}
                            onChange={(e) => updateEntry(index, "title", e.target.value)}
                        />
                        <input
                            type="text" placeholder="Company" value={entry.company}
                            onChange={(e) => updateEntry(index, "company", e.target.value)}
                        />
                    </div>
                    <div className="list-editor__row">
                        <input
                            type="month" value={entry.startDate ? entry.startDate.slice(0, 7) : ""}
                            onChange={(e) => updateEntry(index, "startDate", e.target.value)}
                        />
                        <input
                            type="month" value={entry.endDate ? entry.endDate.slice(0, 7) : ""}
                            disabled={entry.current}
                            onChange={(e) => updateEntry(index, "endDate", e.target.value)}
                        />
                        <label className="list-editor__checkbox">
                            <input
                                type="checkbox" checked={entry.current}
                                onChange={(e) => updateEntry(index, "current", e.target.checked)}
                            />
                            Current role
                        </label>
                    </div>
                    <textarea
                        placeholder="What did you work on?" value={entry.description} maxLength={1000}
                        onChange={(e) => updateEntry(index, "description", e.target.value)}
                    />
                    <button type="button" className="button ghost-button button-sm" onClick={() => removeEntry(index)}>
                        Remove
                    </button>
                </div>
            ))}
            <button type="button" className="button secondary-button button-sm" onClick={addEntry}>
                + Add experience
            </button>
        </div>
    )
}

export default ExperienceEditor
