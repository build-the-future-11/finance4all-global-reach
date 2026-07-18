-- Deep-link lab application status notifications to the project detail page
CREATE OR REPLACE FUNCTION notify_lab_application_status()
RETURNS TRIGGER AS $$
DECLARE
  project_title TEXT;
BEGIN
  IF NEW.status IS DISTINCT FROM OLD.status
     AND NEW.status IN ('accepted', 'rejected', 'under_review') THEN
    SELECT title INTO project_title FROM research_projects WHERE id = NEW.project_id;
    INSERT INTO notifications (user_id, type, title, body, link)
    VALUES (
      NEW.applicant_id,
      'lab_application_status',
      'Application update',
      'Your application to "' || COALESCE(project_title, 'a project') || '" is now ' ||
        replace(NEW.status::text, '_', ' ') || '.',
      '/portal/labs/' || NEW.project_id::TEXT
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public;
