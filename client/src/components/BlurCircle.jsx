import React from 'react'

const BlurCircle = ({ top = "auto", left = "auto", right = "auto", bottom = "auto", size = "h-96 w-96" }) => {
    return (
        <div className={`absolute -z-50 ${size} aspect-square rounded-full bg-primary/30 blur-3xl`}
            style={{ top, left, right, bottom }} />
    )
}

export default BlurCircle