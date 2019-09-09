package org.github.mamoru.cybertempbot.ext

import org.github.mamoru.cybertempbot.dao.SessionContextDao
import org.github.mamoru.cybertempbot.entity.SessionContext
import org.github.mamoru.cybertempbot.entity.SessionState
import org.github.mamoru.cybertempbot.telegram.TgSession

val AUTHENTICATED_STATES = arrayOf(SessionState.AUTHENTICATED)

fun TgSession.getContext(sessionContextDao: SessionContextDao): SessionContext = sessionContextDao
        .getContext(this.sessionId)

fun TgSession.isAuthenticated(sessionContextDao: SessionContextDao): Boolean {
    val context = this.getContext(sessionContextDao)
    return AUTHENTICATED_STATES
            .contains(context.state)
}
