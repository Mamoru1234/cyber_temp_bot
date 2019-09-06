package org.github.mamoru.cybertempbot.entity

enum class SessionState {
    UNKNOWN,
    AUTH_ASKED,
    AUTHENTICATED
}

data class SessionContext(
        var state: SessionState = SessionState.UNKNOWN,
        var auth: Boolean = false
)
