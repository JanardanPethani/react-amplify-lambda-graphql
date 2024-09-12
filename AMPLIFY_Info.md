## Organization Access Management in Amplify App

Our application, designed for multi-tenancy, incorporates AWS Lambda and Cognito User Pools to establish flexible, dynamic authorization rules. Custom Lambda triggers (`PostConfirmation` and `PreTokenGeneration`) alongside the Amplify CLI facilitate this setup, with GraphQL resolvers ensuring data is filtered by organization at the API level.

## Organization Access Management in our Amplify App

In the context of building applications that support multiple organizations (multi-tenancy), there often arises a need to have flexible and dynamic authorization rules. Our app, Agentzy, is built with such functionality in mind.

### Problem Statement

While AWS Amplify provides a set of built-in authorization rules, at the time of implementation, there was no direct way to apply AND/OR conditions directly in GraphQL models for multi-tenancy support.

### Solution

Our workaround to this limitation is to leverage AWS Lambda and Cognito User Pools:

1. **Lambda Functions**:

   - Two Lambda triggers are employed:
     - `PostConfirmation`: Assigns users to the appropriate user group upon sign-up.
     - `PreTokenGeneration`: Modifies the user's tokens before they are returned. This function embeds the user's organization ID into the token, allowing us to filter data by organization at the API level.

2. **Amplify CLI**:

   - With Amplify CLI, we're able to set up and manage our Lambda functions and integrate them with Cognito.

3. **GraphQL Resolvers**:
   - Custom resolvers are used to check the embedded organization ID in the token against the organization ID of the requested data.

### Benefits

- **Flexibility**: This approach provides dynamic filtering based on the user's token, allowing for organization-specific data fetching.
- **Security**: The embedded organization ID in the token ensures that users only access data pertinent to their organization.

### Drawbacks

- **Cost**: Each authorization event invokes an additional Lambda function call, which could increase costs.
- **Complexity**: This solution, while effective, does add a layer of complexity to our authorization setup.

### Future Improvements

There is an open feature request on the AWS Amplify repository that, if implemented, would provide a more direct way to define AND/OR conditions in GraphQL models, potentially eliminating the need for our current workaround.

🔗 [View the feature request here](https://github.com/aws-amplify/amplify-category-api/issues/449#issuecomment-1718291662)

This approach was heavily inspired by an article on creating a simple multi-tenant AWS Amplify mobile app.
📖 [Read the article here](https://medium.com/@dantasfiles/creating-a-simple-multi-tenant-aws-amplify-mobile-app-e26119ab8246)
