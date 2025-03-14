using com.mindset as mymodel from '../db/data-model';

@path : 'srv/AllServices'

service AllServices {
    type TabularResponse {
        row: Integer;
        column1: String;
        column2: String;
        column3: String;
        column4: String;
        column5: String;
        semanticObject: String;
        action: String;
        parameter: String;
    }

    type Headers {
        column1: String;
        column2: String;
        column3: String;
        column4: String;
        column5: String;
    }

    type GPTResponse {
        header: Headers;
        table: array of TabularResponse;
        headerText: String
    }

    entity Context {
        Customer: String;
        CustomerNumber: String;
        InvoiceNumber: String;
        Topic: String;
    }

    // Call like http://localhost:4004/odata/v4/srv/AllServices/respond(transcript='Text')
    function respond(transcript: String) returns GPTResponse;
}



