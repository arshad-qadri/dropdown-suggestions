import React, { useEffect, useRef, useState } from 'react'

const DropdownSuggestion = () => {
    const [data, setData] = useState([])
    const [search, setSearch] = useState("")
    const [loading, setLoading] = useState(false)
    const [selected, setSelected] = useState([])
    const [selectedOption, setSelectedOption] = useState(0)
    const timeoutID = useRef(null)
    const searchRef = useRef()
    const listRefs = useRef([]) // ✅ Array of refs

    const fetchData = async () => {
        setLoading(true)
        try {
            const res = await fetch(`https://dummyjson.com/users/search?q=${search}`)
            const resData = await res.json()
            setData(resData?.users || [])
        } catch (error) {
            console.log("Fetch error:", error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (search) {
            clearTimeout(timeoutID.current)
            timeoutID.current = setTimeout(fetchData, 500)
        } else {
            setData([])
        }
        return () => clearTimeout(timeoutID.current)
    }, [search])

    const handleSelect = (user) => {
        setSelected(prev => [...prev, user])
        setSearch("")
        searchRef.current.focus()
    }

    const handleRemove = (user) => {
        setSelected(prev => prev.filter((u) => u.id !== user.id))
        searchRef.current.focus()
    }

    const filteredData = data.filter(user => !selected.find(sel => sel.id === user.id))

    const handleKeyDown = (e) => {

        if (e.key === "Backspace" && !search && selected.length > 0) {
            handleRemove(selected[selected.length - 1])
        }
        if (e.key === "Enter") {
            if (filteredData[selectedOption]) {
                handleSelect(filteredData[selectedOption])
                setSelectedOption(0)
            }
        }
        if (e.key === "ArrowDown") {
            e.preventDefault()
            setSelectedOption(prev => Math.min(prev + 1, filteredData.length - 1))
            searchRef.current.focus()
        }
        if (e.key === "ArrowUp") {
            e.preventDefault()
            setSelectedOption(prev => Math.max(prev - 1, 0))
            searchRef.current.focus()
        }
    }

    useEffect(() => {
        if (listRefs.current[selectedOption]) {
            listRefs.current[selectedOption].scrollIntoView({
                behavior: "smooth",
                block: "nearest"
            })
        }
    }, [selectedOption])

    return (
        <>
            <div className='selected'>
                {selected.map(user => (
                    <div className='selected-child' key={user.id}>
                        <img src={user.image} alt={user.firstName} />
                        <span>{user.firstName} {user.lastName}</span>
                        <span className='cross' onClick={() => handleRemove(user)}>&times;</span>
                    </div>
                ))}
            </div>

            <div className='suggestion-wrapper'>
                <input
                    ref={searchRef}
                    type="text"
                    placeholder="Enter here..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    onKeyDown={handleKeyDown}
                />
                <ul className='suggestion-container'>
                    {
                        filteredData.length > 0 ? filteredData.map((user, index) => {
                            const name = `${user.firstName} ${user.lastName}`
                            const regex = new RegExp(search, "gi")
                            const highlighted = name.replace(regex, match => `<b>${match}</b>`)

                            return (
                                <li
                                    key={user.id}
                                    ref={el => listRefs.current[index] = el} // ✅ Save ref
                                    onClick={() => handleSelect(user)}
                                    className={selectedOption === index ? "selected-option" : ""}
                                >
                                    <img src={user.image} alt={user.firstName} />
                                    <span dangerouslySetInnerHTML={{ __html: highlighted }} />
                                </li>
                            )
                        })
                            : search && <li>{loading ? "Loading..." : "No Data Found"}</li>
                    }
                </ul>
            </div>
        </>
    )
}

export default DropdownSuggestion
