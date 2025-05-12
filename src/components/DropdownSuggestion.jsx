import React, { useEffect, useRef, useState } from 'react'

const DropdownSuggestion = () => {
    const [data, setData] = useState([])
    const [search, setSearch] = useState("")
    const timeoutID = useRef(null)
    const [loading, setLoading] = useState(false)
    const [selected, setSlected] = useState([])
    const searchRef = useRef()
    const fetchData = async () => {
        setLoading(true)
        const url = `https://dummyjson.com/users/search?q=${search}`

        await fetch(url)
            .then((res) => res.json()) // ✅ response ko parse karo
            .then((resData) => {
                setData(resData?.users || []) // ✅ data set karo
            })
            .catch((error) => {
                console.log("Fetch error:", error)
            })
            .finally(() => {
                setLoading(false) // ✅ loading hatao
            })
    }

    useEffect(() => {
        if (search) {
            if (timeoutID.current) {
                clearTimeout(timeoutID.current)
            }
            timeoutID.current = setTimeout(() => {
                fetchData()
            }, 500);

        } else {
            setData([])
        }
        return () => clearTimeout(timeoutID.current)
    }, [search])

    const handleSelect = (user) => {
        setSlected((perv) => [...perv, user])
        setSearch("")
        searchRef.current.focus()
    }
    console.log(selected);
    const handleRemove = (user) => {
        const updatedSelected = selected.filter((usr) => user.id !== usr.id)
        setSlected(updatedSelected)
        searchRef.current.focus()
    }
    const handleKeydown = (e) => {
        if (e.key === "Backspace" && !search && selected.length > 0) {
            const lastUser = selected[selected.length - 1]
            handleRemove(lastUser)
        }

    }
    return (
        <>
            <div className='selected'>{
                selected && selected.length > 0 &&
                selected.map((user) => {
                    const name = `${user?.firstName} ${user?.lastName}`
                    return (
                        <div className='slected-child' key={user.id}>
                            <img src={user?.image} alt={user?.firstName} /> <span>{name}</span> <span className='cross' onClick={() => handleRemove(user)}>&times;</span>
                        </div>
                    )
                })}
                { }

            </div>
            <div className='suggestion-wrapper'>
                <input type="text" placeholder='Enter here...' ref={searchRef} value={search}
                    onChange={(e) => { setSearch(e.target.value) }} onKeyDown={handleKeydown} />
                <ul className='suggestion-container'>
                    {
                        data && data.length > 0 ?
                            data.filter((user) => !selected.find((sel) => sel.id === user.id)).map((user) => {
                                let name = `${user?.firstName} ${user?.lastName}`
                                if (search) {
                                    const regex = new RegExp(search, "gi")
                                    const matchedValues = name.match(regex);
                                    const splittedValue = name.split(regex)
                                    name = splittedValue?.length > 0 && matchedValues ? `${splittedValue[0]}<b>${matchedValues[0]}</b>${splittedValue[1]}` : name
                                }

                                return <li key={user.id} onClick={() => handleSelect(user)} > <img src={user?.image} alt={user?.firstName} />
                                    <span dangerouslySetInnerHTML={{ __html: name }}></span></li>
                            })
                            : search &&
                            <li>{loading ? "Loading..." : "No Data Found"}</li>
                    }
                </ul>
            </div>
        </>
    )
}

export default DropdownSuggestion
