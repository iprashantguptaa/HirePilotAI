import { useState } from "react"

const SkillsInput = ({ skills, onChange }) => {
    const [ draft, setDraft ] = useState("")

    const addSkill = () => {
        const value = draft.trim()
        if (!value || skills.includes(value)) {
            setDraft("")
            return
        }
        onChange([ ...skills, value ])
        setDraft("")
    }

    const removeSkill = (skill) => {
        onChange(skills.filter((s) => s !== skill))
    }

    const handleKeyDown = (e) => {
        if (e.key === "Enter" || e.key === ",") {
            e.preventDefault()
            addSkill()
        }
    }

    return (
        <div className="skills-input">
            <div className="skills-input__chips">
                {skills.map((skill) => (
                    <span key={skill} className="skills-input__chip">
                        {skill}
                        <button type="button" onClick={() => removeSkill(skill)} aria-label={`Remove ${skill}`}>&times;</button>
                    </span>
                ))}
            </div>
            <div className="skills-input__field">
                <input
                    type="text"
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Add a skill and press Enter"
                    maxLength={40}
                />
                <button type="button" className="button secondary-button button-sm" onClick={addSkill}>Add</button>
            </div>
        </div>
    )
}

export default SkillsInput
