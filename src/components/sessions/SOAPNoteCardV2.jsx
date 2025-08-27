import React from 'react';
import { Card, Box, Typography, Button } from '@mui/material';
import { saveAs } from 'file-saver';

/** Very lightweight card that expects a session row with structured_notes **/
export default function SOAPNoteCardV2({ session }) {
  const { structured_notes: notes } = session;

  const downloadJson = () => {
    const blob = new Blob([JSON.stringify(notes, null, 2)], { type: 'application/json' });
    saveAs(blob, `session-${session.id}-notes.json`);
  };

  return (
    <Card sx={{ p: 2, mb: 2 }}>
      <Typography variant="h6" mb={1}>
        {session.body_region} – {session.session_type}
      </Typography>

      {notes ? (
        <pre style={{ whiteSpace: 'pre-wrap', fontSize: 12 }}>{JSON.stringify(notes, null, 2)}</pre>
      ) : (
        <Typography color="text.secondary">No structured notes yet.</Typography>
      )}

      {notes && (
        <Box mt={2}>
          <Button variant="outlined" onClick={downloadJson} size="small">
            Download JSON
          </Button>
        </Box>
      )}
    </Card>
  );
}
