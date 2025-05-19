BEGIN TRY
    IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[CodeSubmissions]') AND name = 'CompletedAt')
    BEGIN
        PRINT 'Adding CompletedAt column...'
        ALTER TABLE [dbo].[CodeSubmissions]
        ADD [CompletedAt] datetime2 NULL;
        PRINT 'CompletedAt column added successfully.'
    END
    ELSE
    BEGIN
        PRINT 'CompletedAt column already exists.'
    END

    IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[CodeSubmissions]') AND name = 'SubmittedAt')
    BEGIN
        PRINT 'Adding SubmittedAt column...'
        ALTER TABLE [dbo].[CodeSubmissions]
        ADD [SubmittedAt] datetime2 NULL;
        PRINT 'SubmittedAt column added successfully.'
    END
    ELSE
    BEGIN
        PRINT 'SubmittedAt column already exists.'
    END
END TRY
BEGIN CATCH
    PRINT 'Error: ' + ERROR_MESSAGE()
    PRINT 'Error Number: ' + CAST(ERROR_NUMBER() AS VARCHAR)
    PRINT 'Error Severity: ' + CAST(ERROR_SEVERITY() AS VARCHAR)
    PRINT 'Error State: ' + CAST(ERROR_STATE() AS VARCHAR)
    PRINT 'Error Line: ' + CAST(ERROR_LINE() AS VARCHAR)
END CATCH 